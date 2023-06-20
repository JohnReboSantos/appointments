from rest_framework.views import APIView
from rest_framework.response import Response
from knox.auth import AuthToken
from knox.views import LoginView as KnoxLoginView
from .serializers import RegisterSerializer, LoginSerializer


class LoginAPIView(KnoxLoginView):
    permission_classes = []

    def post(self, request, format=None):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        _, token = AuthToken.objects.create(user)

        return Response({
            'key': token,
            'user': {
                'pk': user.pk,
                'username': user.username,
                'first_name': user.name.split()[0],
                'last_name': ' '.join(user.name.split()[1:]) if len(user.name.split()) > 1 else '',
                'email': user.email,
                'date_of_birth': user.date_of_birth
            }
        })


class GetUserDataAPIView(APIView):
    def get(self, request):
        user = request.user

        if user.is_authenticated:
            return Response({
                'user_info': {
                    'id': user.id,
                    'name': user.name,
                    'email': user.email
                },
            })

        return Response({'error': 'not authenticated'}, status=400)


class RegisterAPIView(APIView):
    def post(self, request):
        data = request.data

        if isinstance(data, str):  # Handling 'application/x-www-form-urlencoded' format
            username = request.POST.get('username')
            name = request.POST.get('name')
            email = request.POST.get('email')
            password1 = request.POST.get('password1')
            password2 = request.POST.get('password2')
            date_of_birth = request.POST.get('date_of_birth')
        else:  # Assuming JSON format
            username = data.get('username')
            name = data.get('name')
            email = data.get('email')
            password1 = data.get('password1')
            password2 = data.get('password2')
            date_of_birth = data.get('date_of_birth')

        serializer = RegisterSerializer(data={
            'username': username,
            'name': name,
            'email': email,
            'password1': password1,
            'password2': password2,
            'date_of_birth': date_of_birth
        })
        serializer.is_valid(raise_exception=True)

        user = serializer.save()
        _, token = AuthToken.objects.create(user)

        return Response({
            'user_info': {
                'id': user.id,
                'name': user.name,
                'email': user.email
            },
            'token': token
        })
