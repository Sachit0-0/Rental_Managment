from rest_framework import serializers
from .models import Bike, Rental, CustomUser  # Updated import

class BikeSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False)

    class Meta:
        model = Bike
        fields = ['id', 'name', 'model', 'bike_type', 'availability', 'price_per_hour', 'image']

class RentalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rental
        fields = ['id', 'user', 'bike', 'start_time', 'end_time', 'total_price']
        read_only_fields = ['start_time', 'end_time']

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    gender = serializers.ChoiceField(choices=CustomUser.GENDER_CHOICES)  # Added gender field

    class Meta:
        model = CustomUser  # Use CustomUser instead of User
        fields = ['username', 'email', 'password', 'gender']  # Include gender in fields

    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            gender=validated_data['gender']  # Save gender during user creation
        )
        return user
