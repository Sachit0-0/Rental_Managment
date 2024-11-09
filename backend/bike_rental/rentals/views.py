from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from datetime import timedelta
from sklearn.metrics.pairwise import cosine_similarity
from transformers import pipeline

from .models import Bike, Rental, Review
from .serializers import BikeSerializer, RentalSerializer, UserSerializer, ReviewSerializer


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


class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        bike_id = self.request.query_params.get('bike_id')
        if bike_id:
            return Review.objects.filter(bike_id=bike_id)
        return Review.objects.all()

    def perform_create(self, serializer):
        if self.request.user.is_authenticated:
            serializer.save(user=self.request.user)
        else:
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


class BikeRecommendationView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        bikes = Bike.objects.filter(availability=True)
        scored_bikes = []
        for bike in bikes:
            score = 1 if (user.gender.lower() == "m" and bike.bike_type.lower() == "bike") else 0
            scored_bikes.append((bike, score))

        scored_bikes.sort(key=lambda x: x[1], reverse=True)
        sorted_bikes = [bike for bike, _ in scored_bikes]
        serializer = BikeSerializer(sorted_bikes, many=True, context={'request': request})
        
        return Response(serializer.data)


# Initialize the similarity model
similarity_model = pipeline('feature-extraction', model='bert-base-uncased')  # Replace with your model

class SimilarBikesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, bike_id):
        
        user = request.user
        
        try:
            bike = Bike.objects.get(id=bike_id)
        except Bike.DoesNotExist:
            return Response({"error": "Bike not found."}, status=status.HTTP_404_NOT_FOUND)

        if not bike.description:
            return Response({"error": "The bike description is blank."}, status=status.HTTP_400_BAD_REQUEST)

        similar_bikes = Bike.objects.filter(availability=True, bike_type=bike.bike_type).exclude(id=bike_id)
        
        if not similar_bikes:
            return Response({"message": "No similar bikes found."}, status=status.HTTP_200_OK)
        
        current_bike_embedding = similarity_model(bike.description)[0]
        current_bike_embedding = current_bike_embedding[0]

        bike_descriptions = [b.description for b in similar_bikes if b.description]
        if not bike_descriptions:
            return Response({"message": "No other bikes with descriptions found."}, status=status.HTTP_200_OK)
        
        bike_embeddings = []
        for desc in bike_descriptions:
            embedding = similarity_model(desc)[0]
            bike_embeddings.append(embedding[0])

        similarities = cosine_similarity([current_bike_embedding], bike_embeddings)
        sorted_bikes = sorted(zip(similar_bikes, similarities[0]), key=lambda x: x[1], reverse=True)

        sorted_bike_objects = [b[0] for b in sorted_bikes]

        serializer = BikeSerializer(sorted_bike_objects, many=True, context={'request': request})
        return Response(serializer.data)

