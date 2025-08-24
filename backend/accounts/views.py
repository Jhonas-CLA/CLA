from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
from django.contrib.auth.hashers import make_password
from django.contrib.auth.decorators import login_required, user_passes_test
from django.shortcuts import Http404
from .models import User


User = get_user_model()

@csrf_exempt
def register_view(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            password = data.get('password')
            nombre = data.get('first_name')
            apellido = data.get('last_name')
            rol = data.get('rol', 'usuario')  # Por defecto usuario

            if User.objects.filter(email=email).exists():
                return JsonResponse({'error': 'Ya existe ese email'}, status=400)

            user = User.objects.create_user(
                email=email, 
                password=password, 
                first_name=nombre, 
                last_name=apellido, 
                rol=rol
            )
            
            return JsonResponse({
                'message': 'Usuario registrado con éxito',
                'user_id': user.id,
                'email': user.email
            })
        except Exception as e:
            return JsonResponse({'error': f'Error al registrar usuario: {str(e)}'}, status=500)
    
    return JsonResponse({'error': 'Método no permitido'}, status=405)

@csrf_exempt
def login_view(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            password = data.get('password')

            user = authenticate(request, username=email, password=password)
            if user is not None:
                role = 'admin' if user.is_staff or user.rol == 'admin' else 'usuario'
                return JsonResponse({
                    'success': True,
                    'role': role,
                    'email': user.email,
                    'user_id': user.id,
                    'first_name': user.first_name,
                    'last_name': user.last_name
                })
            else:
                return JsonResponse({'success': False, 'message': 'Correo o contraseña incorrectos'})
        except Exception as e:
            return JsonResponse({'success': False, 'message': f'Error en login: {str(e)}'}, status=500)
    
    return JsonResponse({'error': 'Método no permitido'}, status=405)

@csrf_exempt
def enviar_email_reset(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            email = data.get('email')
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
        except Exception as e:
            return JsonResponse({'error': f'Error al enviar correo: {str(e)}'}, status=500)

@csrf_exempt
def resetear_password(request, uidb64, token):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            password = data.get('password')
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)

            if default_token_generator.check_token(user, token):
                user.set_password(password)
                user.save()
                return JsonResponse({'message': 'Contraseña cambiada correctamente'})
            else:
                return JsonResponse({'error': 'Token inválido'}, status=400)

        except Exception as e:
            return JsonResponse({'error': 'Error al cambiar la contraseña'}, status=500)

    return JsonResponse({'error': 'Método no permitido'}, status=405)

# Vista mejorada para listar usuarios
@csrf_exempt
def lista_usuarios(request):
    if request.method == 'GET':
        try:
            usuarios = User.objects.all().order_by('-date_joined')
            data = []
            
            for usuario in usuarios:
                data.append({
                    'id': usuario.id,
                    'email': usuario.email,
                    'first_name': usuario.first_name,
                    'last_name': usuario.last_name,
                    'full_name': f"{usuario.first_name} {usuario.last_name}".strip(),
                    'rol': usuario.rol,
                    'phone': usuario.phone or '',
                    'is_active': usuario.is_active,
                    'is_staff': usuario.is_staff,
                    'email_verified': usuario.email_verified,
                    'date_joined': usuario.date_joined.strftime('%Y-%m-%d %H:%M:%S') if usuario.date_joined else None,
                    'last_login': usuario.last_login.strftime('%Y-%m-%d %H:%M:%S') if usuario.last_login else 'Nunca',
                    'profile_image': request.build_absolute_uri(usuario.profile_image.url) if usuario.profile_image else None,
                })
            
            return JsonResponse({
                'success': True,
                'usuarios': data,
                'total': len(data)
            })
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': f'Error al obtener usuarios: {str(e)}'
            }, status=500)
    
    return JsonResponse({'error': 'Método no permitido'}, status=405)

# Vista para obtener detalles de un usuario específico
@csrf_exempt
def detalle_usuario(request, user_id):
    if request.method == 'GET':
        try:
            usuario = User.objects.get(id=user_id)
            data = {
                'id': usuario.id,
                'email': usuario.email,
                'first_name': usuario.first_name,
                'last_name': usuario.last_name,
                'rol': usuario.rol,
                'phone': usuario.phone,
                'is_active': usuario.is_active,
                'is_staff': usuario.is_staff,
                'email_verified': usuario.email_verified,
                'date_joined': usuario.date_joined.isoformat() if usuario.date_joined else None,
                'last_login': usuario.last_login.isoformat() if usuario.last_login else None,
                'profile_image': request.build_absolute_uri(usuario.profile_image.url) if usuario.profile_image else None,
            }
            return JsonResponse({'success': True, 'usuario': data})
        except User.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Usuario no encontrado'}, status=404)
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Método no permitido'}, status=405)

# NUEVAS FUNCIONES PARA EDITAR E INHABILITAR USUARIOS

@csrf_exempt
def editar_usuario(request, user_id):
    if request.method == 'PUT':
        try:
            data = json.loads(request.body)
            usuario = User.objects.get(id=user_id)
            
            # Actualizar campos si están presentes en la data
            if 'first_name' in data:
                usuario.first_name = data['first_name']
            if 'last_name' in data:
                usuario.last_name = data['last_name']
            if 'email' in data:
                # Verificar que el email no esté en uso por otro usuario
                if User.objects.filter(email=data['email']).exclude(id=user_id).exists():
                    return JsonResponse({'success': False, 'error': 'Ese email ya está en uso'}, status=400)
                usuario.email = data['email']
            if 'phone' in data:
                usuario.phone = data['phone']
            if 'rol' in data:
                usuario.rol = data['rol']
            
            usuario.save()
            
            return JsonResponse({
                'success': True,
                'message': 'Usuario actualizado correctamente',
                'usuario': {
                    'id': usuario.id,
                    'email': usuario.email,
                    'first_name': usuario.first_name,
                    'last_name': usuario.last_name,
                    'full_name': f"{usuario.first_name} {usuario.last_name}".strip(),
                    'rol': usuario.rol,
                    'phone': usuario.phone or '',
                    'is_active': usuario.is_active,
                    'is_staff': usuario.is_staff,
                    'email_verified': usuario.email_verified,
                }
            })
            
        except User.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Usuario no encontrado'}, status=404)
        except Exception as e:
            return JsonResponse({'success': False, 'error': f'Error al actualizar usuario: {str(e)}'}, status=500)
    
    return JsonResponse({'error': 'Método no permitido'}, status=405)

@csrf_exempt
def toggle_usuario_estado(request, user_id):
    if request.method == 'PATCH':
        try:
            usuario = User.objects.get(id=user_id)
            
            # Cambiar el estado activo/inactivo
            usuario.is_active = not usuario.is_active
            usuario.save()
            
            return JsonResponse({
                'success': True,
                'message': f'Usuario {"habilitado" if usuario.is_active else "inhabilitado"} correctamente',
                'is_active': usuario.is_active
            })
            
        except User.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Usuario no encontrado'}, status=404)
        except Exception as e:
            return JsonResponse({'success': False, 'error': f'Error al cambiar estado: {str(e)}'}, status=500)
    
    return JsonResponse({'error': 'Método no permitido'}, status=405)