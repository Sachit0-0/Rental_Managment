from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Bike, Rental
from .serializers import BikeSerializer, RentalSerializer, UserSerializer
from django.utils import timezone
from rest_framework.permissions import AllowAny


class ProfileView(APIView):
    """View to retrieve user's profile information along with their rental history."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        user_serializer = UserSerializer(user)
        rentals = Rental.objects.filter(user=user)
        rental_serializer = RentalSerializer(rentals, many=True)

        response_data = {
            'user_info': user_serializer.data,
            'rental_history': rental_serializer.data
        }

        return Response(response_data)

class BikeViewSet(viewsets.ModelViewSet):
    queryset = Bike.objects.all()
    serializer_class = BikeSerializer
    permission_classes = [AllowAny]  

    def get_queryset(self):
        return Bike.objects.filter(availability=True)


from datetime import timedelta
class RentalViewSet(viewsets.ModelViewSet):
    queryset = Rental.objects.all()
    serializer_class = RentalSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        bike = Bike.objects.get(id=request.data['bike'])
        if not bike.availability:
            return Response({"error": "Bike is not available"}, status=status.HTTP_400_BAD_REQUEST)

        rental_days = request.data.get('rental_days', 1)  
        end_time = timezone.now() + timedelta(days=rental_days)

        rental = Rental.objects.create(user=request.user, bike=bike, end_time=end_time)
        bike.availability = False
        bike.save()

        return Response(RentalSerializer(rental).data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        rental = self.get_object()
        rental.end_time = timezone.now()
        duration = (rental.end_time - rental.start_time).total_seconds() / 3600
        rental.total_price = duration * rental.bike.price_per_hour
        rental.save()

        rental.bike.availability = True
        rental.bike.save()

        return Response(RentalSerializer(rental).data)

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            gender = request.data.get('gender')
            user = serializer.save(gender=gender)  
            return Response({"message": "User created successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data['refresh']
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Successfully logged out"}, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=400)

from transformers import pipeline
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Bike  # Assuming Bike is your model for available bikes
from .serializers import BikeSerializer

# Load a pre-trained Transformer model
recommendation_model = pipeline('text-classification', model='distilbert-base-uncased')

from rest_framework.response import Response

class TNNBikeRecommendationView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        user_input = "Male user, prefers fast bikes." if user.gender == 'M' else "Female user, prefers scooters and lightweight bikes."
        
        prediction = recommendation_model(user_input)[0]['label'].lower()
        bike_type = 'bike' if 'bike' in prediction else 'scooter'
        
        recommended_bikes = Bike.objects.filter(bike_type=bike_type, availability=True)
        serializer = BikeSerializer(recommended_bikes, many=True, context={'request': request})  
        
        return Response(serializer.data)
