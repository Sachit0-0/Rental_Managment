from rest_framework.routers import DefaultRouter
from .views import BikeViewSet, RentalViewSet ,ReviewViewSet

router = DefaultRouter()
router.register(r'bikes', BikeViewSet)
router.register(r'rentals', RentalViewSet)
router.register(r'reviews', ReviewViewSet, basename='review')


urlpatterns = router.urls
 