import json
import urllib.parse
from django.core.mail import send_mail
from django.http import JsonResponse, Http404
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.hashers import make_password
from django.contrib.auth.tokens import default_token_generator

# DRF
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

# JWT
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

# -------------------------------------------------------------------
# 🔹 AUTENTICACIÓN Y REGISTRO
# -------------------------------------------------------------------

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
    """Login clásico con JsonResponse"""
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


@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    """Login con JWT"""
    email = request.data.get('email')
    password = request.data.get('password')

    if not email or not password:
        return Response({'error': 'Email y contraseña son requeridos'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Buscar usuario por email
        user = User.objects.get(email=email)
        
        # Autenticar usando email como username
        user = authenticate(username=email, password=password)
        
        if user:
            # Verificar que la cuenta esté activa
            if not user.is_active:
                return Response({'error': 'Tu cuenta está inactiva. Contacta al administrador'}, 
                              status=status.HTTP_401_UNAUTHORIZED)
            
            # Generar tokens JWT
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'is_staff': user.is_staff,
                    'rol': user.rol,
                }
            })
        else:
            return Response({'error': 'Credenciales inválidas'}, status=status.HTTP_401_UNAUTHORIZED)
            
    except User.DoesNotExist:
        return Response({'error': 'Credenciales inválidas'}, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        return Response({'error': f'Error interno del servidor: {str(e)}'}, 
                       status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_user(request):
    """Logout con JWT (blacklist refresh token)"""
    try:
        refresh_token = request.data["refresh"]
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({'message': 'Logout exitoso'})
    except Exception:
        return Response({'error': 'Error al hacer logout'}, status=status.HTTP_400_BAD_REQUEST)


# -------------------------------------------------------------------
# 🔹 RECUPERAR / RESETEAR CONTRASEÑA
# -------------------------------------------------------------------

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
        except Exception:
            return JsonResponse({'error': 'Error al cambiar la contraseña'}, status=500)

    return JsonResponse({'error': 'Método no permitido'}, status=405)


# -------------------------------------------------------------------
# 🔹 USUARIOS
# -------------------------------------------------------------------

@csrf_exempt
def lista_usuarios(request):
    if request.method == 'GET':
        try:
            usuarios = User.objects.all().order_by('-date_joined')
            data = [{
                'id': u.id,
                'email': u.email,
                'first_name': u.first_name,
                'last_name': u.last_name,
                'full_name': f"{u.first_name} {u.last_name}".strip(),
                'rol': u.rol,
                'phone': getattr(u, 'phone', ''),
                'is_active': u.is_active,
                'is_staff': u.is_staff,
                'email_verified': getattr(u, 'email_verified', False),
                'date_joined': u.date_joined.strftime('%Y-%m-%d %H:%M:%S') if u.date_joined else None,
                'last_login': u.last_login.strftime('%Y-%m-%d %H:%M:%S') if u.last_login else 'Nunca',
                'profile_image': request.build_absolute_uri(u.profile_image.url) if getattr(u, 'profile_image', None) else None,
            } for u in usuarios]

            return JsonResponse({'success': True, 'usuarios': data, 'total': len(data)})
        except Exception as e:
            return JsonResponse({'success': False, 'error': f'Error al obtener usuarios: {str(e)}'}, status=500)

    return JsonResponse({'error': 'Método no permitido'}, status=405)


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


@csrf_exempt
def editar_usuario(request, user_id):
    if request.method == 'PUT':
        try:
            data = json.loads(request.body)
            usuario = User.objects.get(id=user_id)

            if 'first_name' in data:
                usuario.first_name = data['first_name']
            if 'last_name' in data:
                usuario.last_name = data['last_name']
            if 'email' in data:
                if User.objects.filter(email=data['email']).exclude(id=user_id).exists():
                    return JsonResponse({'success': False, 'error': 'Ese email ya está en uso'}, status=400)
                usuario.email = data['email']
            if 'phone' in data:
                usuario.phone = data['phone']
            if 'rol' in data:
                usuario.rol = data['rol']

            usuario.save()
            return JsonResponse({'success': True, 'message': 'Usuario actualizado correctamente'})
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
            usuario.is_active = not usuario.is_active
            usuario.save()
            return JsonResponse({'success': True, 'is_active': usuario.is_active})
        except User.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Usuario no encontrado'}, status=404)
        except Exception as e:
            return JsonResponse({'success': False, 'error': f'Error al cambiar estado: {str(e)}'}, status=500)

    return JsonResponse({'error': 'Método no permitido'}, status=405)


# -------------------------------------------------------------------
# 🔹 PERFIL Y ADMIN
# -------------------------------------------------------------------

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    """Perfil del usuario autenticado con JWT"""
    return Response({
        'id': request.user.id,
        'email': request.user.email,
        'first_name': request.user.first_name,
        'last_name': request.user.last_name,
        'is_staff': request.user.is_staff,
        'email_verified': getattr(request.user, 'email_verified', False),
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_admin_phone(request):
    """Obtener teléfono del administrador"""
    admin_user = User.objects.filter(is_staff=True, is_superuser=True).first()
    if admin_user:
        return Response({'phone': getattr(admin_user, 'telefono', None) or getattr(admin_user, 'phone', None)})
    return Response({'error': 'No se encontró administrador'}, status=404)


# -------------------------------------------------------------------
# 🔹 WHATSAPP PEDIDOS - UNIFIED FUNCTION
# -------------------------------------------------------------------

@csrf_exempt
@require_http_methods(["POST"])
def enviar_pedido_whatsapp(request):
    """
    Función unificada para manejar pedidos por WhatsApp.
    Valida usuario registrado y genera URL de WhatsApp.
    """
    try:
        data = json.loads(request.body.decode("utf-8"))
        email = data.get("email")
        productos = data.get("productos", [])
        total = data.get("total", 0)

        # Validar campos requeridos
        if not email:
            return JsonResponse({
                "error": "EMAIL_REQUIRED", 
                "message": "El correo electrónico es requerido"
            }, status=400)

        if not productos:
            return JsonResponse({
                "error": "PRODUCTS_REQUIRED", 
                "message": "Debe incluir al menos un producto"
            }, status=400)

        # Verificar si el correo ingresado existe en la BD
        try:
            usuario = User.objects.get(email=email)
        except User.DoesNotExist:
            return JsonResponse({
                "error": "USER_NOT_REGISTERED", 
                "message": "El correo no está registrado en el sistema"
            }, status=400)

        # Verificar que el usuario esté activo
        if not usuario.is_active:
            return JsonResponse({
                "error": "USER_INACTIVE", 
                "message": "Tu cuenta está inactiva. Contacta al administrador"
            }, status=400)

        # Buscar al admin que tenga un número de teléfono registrado
        admin = User.objects.filter(rol="admin", phone__isnull=False).exclude(phone="").first()
        
        if not admin:
            # Intentar buscar por is_staff si no encuentra por rol
            admin = User.objects.filter(is_staff=True, phone__isnull=False).exclude(phone="").first()
        
        if not admin:
            return JsonResponse({
                "error": "ADMIN_NOT_FOUND", 
                "message": "No se encontró un administrador con número de WhatsApp configurado"
            }, status=500)

        # Construir el mensaje para WhatsApp
        mensaje = crear_mensaje_whatsapp_detallado(productos, total, usuario)

        # Limpiar número de teléfono (quitar espacios, guiones, etc.)
        telefono_limpio = ''.join(filter(str.isdigit, admin.phone))
        
        # Generar enlace de WhatsApp
        whatsapp_url = f"https://wa.me/{telefono_limpio}?text={mensaje}"

        return JsonResponse({
            "success": True,
            "message": "Pedido preparado correctamente",
            "whatsapp_url": whatsapp_url
        }, status=200)

    except json.JSONDecodeError:
        return JsonResponse({
            "error": "INVALID_JSON", 
            "message": "Datos JSON inválidos"
        }, status=400)
    except Exception as e:
        return JsonResponse({
            "error": "SERVER_ERROR", 
            "message": f"Error interno del servidor: {str(e)}"
        }, status=500)


def crear_mensaje_whatsapp_detallado(productos, total, usuario):
    """
    Crea un mensaje formateado para WhatsApp con los detalles del pedido
    """
    mensaje = "🛍️ *NUEVO PEDIDO*%0A%0A"
    mensaje += f"👤 *Cliente:* {usuario.first_name} {usuario.last_name}%0A"
    mensaje += f"📧 *Email:* {usuario.email}%0A%0A"
    mensaje += "📋 *Detalles del Pedido:*%0A"

    # Agregar cada producto
    for producto in productos:
        nombre = producto.get('nombre', 'Producto sin nombre')
        codigo = producto.get('codigo', 'S/C')
        cantidad = producto.get('cantidad', 1)
        precio = producto.get('precio', 0)
        subtotal = precio * cantidad
        
        mensaje += f"• {nombre} ({codigo})%0A"
        mensaje += f"  Cantidad: {cantidad} x ${precio:,.0f} = ${subtotal:,.0f}%0A%0A"

    mensaje += f"💰 *TOTAL: ${total:,.0f}*%0A"
    mensaje += f"📦 *Total de productos:* {len(productos)}"

    return mensaje