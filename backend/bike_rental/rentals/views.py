from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Bike, Rental, Review
from .serializers import BikeSerializer, RentalSerializer, UserSerializer, ReviewSerializer
from django.utils import timezone
from datetime import timedelta
from transformers import pipeline


recommendation_model = pipeline('text-classification', model='distilbert-base-uncased')


class ProfileView(APIView):
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


from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from .models import Review
from .serializers import ReviewSerializer

class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        bike_id = self.request.query_params.get('bike_id')  # Get bike_id from query parameters
        if bike_id:
            return Review.objects.filter(bike_id=bike_id)  # Filter reviews by bike_id
        return Review.objects.all()  # Return all reviews if no bike_id is provided

def perform_create(self, serializer):
    if self.request.user.is_authenticated:
        serializer.save(user=self.request.user)
    else:
        # Handle the case where the user is not authenticated
        raise ValueError("You must be logged in to create a review.")


class BikeViewSet(viewsets.ModelViewSet):
    queryset = Bike.objects.filter(availability=True)
    serializer_class = BikeSerializer
    permission_classes = [AllowAny]


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


class TNNBikeRecommendationView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        # Setting default preferences based on gender
        preferred_types = "bikes" if user.gender.lower() == "male" else "scooters"

        # Construct the input string for the recommendation model
        user_input = f"{user.gender} user, prefers {preferred_types}."
        prediction = recommendation_model(user_input)[0]['label'].lower()

        bikes = Bike.objects.filter(availability=True)
        scored_bikes = []
        for bike in bikes:
            bike_description = f"{bike.bike_type} that is {bike.description}"
            score_output = recommendation_model(bike_description)[0]
            # Check if the recommendation matches the prediction and adjust the score
            score = score_output['score'] if prediction in score_output['label'].lower() else 0
            scored_bikes.append((bike, score))

        # Sort bikes by score and serialize the sorted list
        scored_bikes.sort(key=lambda x: x[1], reverse=True)
        sorted_bikes = [bike for bike, _ in scored_bikes]
        serializer = BikeSerializer(sorted_bikes, many=True, context={'request': request})
        
        return Response(serializer.data)

