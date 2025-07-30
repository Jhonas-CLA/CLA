from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

@csrf_exempt
def enviar_email_reset(request):
    if request.method == "POST":
        data = json.loads(request.body)
        email = data.get('email')
        try:
            User = get_user_model()
            user = User.objects.get(email=email)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            link = f"http://localhost:3000/reset-password/{uid}/{token}"

            send_mail(
                'Recuperar contraseña',
                f'Ve a este enlace para cambiar tu contraseña: {link}',
                'codigolatino123@gmail.com',
                [email],
                fail_silently=False,
            )
            return JsonResponse({'message': 'Correo enviado'})
        except User.DoesNotExist:
            return JsonResponse({'error': 'Usuario no encontrado'}, status=404)

@csrf_exempt
def resetear_password(request, uidb64, token):
    print("✅ Recibida petición para cambiar contraseña")  # debug

    if request.method == "POST":
        try:
            data = json.loads(request.body)
            password = data.get('password')

            User = get_user_model()
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)

            if default_token_generator.check_token(user, token):
                user.set_password(password)
                user.save()
                return JsonResponse({'message': 'Contraseña cambiada correctamente'})
            else:
                return JsonResponse({'error': 'Token inválido'}, status=400)

        except Exception as e:
            print("❌ Error:", e)
            return JsonResponse({'error': 'Error al cambiar la contraseña'}, status=500)

    return JsonResponse({'error': 'Método no permitido'}, status=405)
