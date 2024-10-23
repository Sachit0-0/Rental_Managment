from rest_framework.routers import DefaultRouter
from .views import BikeViewSet, RentalViewSet

router = DefaultRouter()
router.register(r'bikes', BikeViewSet)
router.register(r'rentals', RentalViewSet)

urlpatterns = router.urls
 