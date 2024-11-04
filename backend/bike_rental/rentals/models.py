# rentals/models.py

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models.signals import post_delete
from django.dispatch import receiver

class CustomUser(AbstractUser):
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
    ]
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, null=True, blank=True)

    def __str__(self):
        return self.username

class Bike(models.Model):
    BIKE_TYPE_CHOICES = [
        ('bike', 'Bike'),
        ('scooter', 'Scooter'),
    ]
    image = models.ImageField(upload_to='images/', null=True, blank=True)
    name = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    bike_type = models.CharField(max_length=10, choices=BIKE_TYPE_CHOICES)
    availability = models.BooleanField(default=True)
    price_per_hour = models.DecimalField(max_digits=5, decimal_places=2)
    description = models.TextField(null=True, blank=True)

    def __str__(self):
        return self.name

class Rental(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE) 
    bike = models.ForeignKey(Bike, on_delete=models.CASCADE)
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    total_price = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.bike.name}"

# Signal to update bike availability after a rental deletion
@receiver(post_delete, sender=Rental)
def update_bike_availability(sender, instance, **kwargs):
    # Set the availability of the bike to True when a Rental instance is deleted
    instance.bike.availability = True
    instance.bike.save()

class Review(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE) 
    bike = models.ForeignKey(Bike, on_delete=models.CASCADE)
    text = models.TextField()
    rating = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.user.username} - {self.bike.name}"
