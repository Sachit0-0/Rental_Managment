
from django.contrib import admin
from .models import Bike, Rental ,CustomUser, Review

admin.site.register(Bike)
admin.site.register(Rental)
admin.site.register(CustomUser)
admin.site.register(Review)

