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
#configuraciones 
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from django.core.exceptions import ValidationError
from django.db import IntegrityError
import json
import logging
from .models import User  # ✅ Importamos tu modelo User

# JWT
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

#configuraciones
logger = logging.getLogger(__name__)

@csrf_exempt
def perfil_admin(request):
    """Obtiene los datos del admin logueado"""
    if request.method == 'GET':
        try:
            # Aquí deberías obtener el usuario del token o sesión
            # Por simplicidad, asumimos que tienes una forma de obtener el usuario actual
            token = request.META.get('HTTP_AUTHORIZATION', '').replace('Bearer ', '')
            
            if not token:
                return JsonResponse({
                    'success': False,
                    'error': 'Token no proporcionado'
                }, status=401)
            
            # Aquí deberías decodificar el token y obtener el usuario
            # Por ahora, obtenemos el primer admin como ejemplo
            admin = User.objects.filter(rol='admin', is_active=True).first()
            
            if not admin:
                return JsonResponse({
                    'success': False,
                    'error': 'Administrador no encontrado'
                }, status=404)
            
            return JsonResponse({
                'success': True,
                'admin': {
                    'id': admin.id,
                    'first_name': admin.first_name,
                    'last_name': admin.last_name,
                    'full_name': admin.full_name,
                    'email': admin.email,
                    'phone': admin.phone,
                    'rol': admin.rol,
                    'is_active': admin.is_active,
                    'date_joined': admin.date_joined.isoformat() if admin.date_joined else None,
                    'last_login': admin.last_login.isoformat() if admin.last_login else "Nunca",
                    'profile_image': admin.get_profile_image_url(),
                    'email_verified': admin.email_verified,
                }
            })
            
        except Exception as e:
            logger.error(f"Error al obtener perfil admin: {str(e)}")
            return JsonResponse({
                'success': False,
                'error': 'Error interno del servidor'
            }, status=500)
    
    return JsonResponse({
        'success': False,
        'error': 'Método no permitido'
    }, status=405)

@csrf_exempt
@require_http_methods(["PUT"])
def actualizar_perfil_admin(request):
    """Actualiza el perfil del admin logueado - solo campos permitidos"""
    try:
        token = request.META.get('HTTP_AUTHORIZATION', '').replace('Bearer ', '')
        
        if not token:
            return JsonResponse({
                'success': False,
                'error': 'Token no proporcionado'
            }, status=401)
        
        # Obtener el admin (por ahora el primer admin activo)
        admin = User.objects.filter(rol='admin', is_active=True).first()
        
        if not admin:
            return JsonResponse({
                'success': False,
                'error': 'Administrador no encontrado'
            }, status=404)
        
        # Parsear datos del request
        data = json.loads(request.body)
        
        # CAMPOS EDITABLES PERMITIDOS para el admin
        campos_permitidos = ['first_name', 'last_name', 'phone']
        
        # Validar que solo se envíen campos permitidos
        campos_enviados = list(data.keys())
        campos_no_permitidos = [campo for campo in campos_enviados if campo not in campos_permitidos]
        
        if campos_no_permitidos:
            return JsonResponse({
                'success': False,
                'error': f'Los siguientes campos no pueden ser modificados: {", ".join(campos_no_permitidos)}',
                'campos_no_permitidos': campos_no_permitidos,
                'campos_permitidos': campos_permitidos
            }, status=400)
        
        # Actualizar solo los campos permitidos
        cambios_realizados = []
        
        if 'first_name' in data:
            valor_anterior = admin.first_name
            admin.first_name = data['first_name'].strip()
            if valor_anterior != admin.first_name:
                cambios_realizados.append(f"Nombre: '{valor_anterior}' → '{admin.first_name}'")
        
        if 'last_name' in data:
            valor_anterior = admin.last_name
            admin.last_name = data['last_name'].strip()
            if valor_anterior != admin.last_name:
                cambios_realizados.append(f"Apellido: '{valor_anterior}' → '{admin.last_name}'")
        
        if 'phone' in data:
            valor_anterior = admin.phone or ""
            admin.phone = data['phone'].strip() if data['phone'] else None
            if valor_anterior != (admin.phone or ""):
                cambios_realizados.append(f"Teléfono: '{valor_anterior}' → '{admin.phone or 'Sin teléfono'}'")
        
        # Validaciones básicas
        if not admin.first_name or not admin.last_name:
            return JsonResponse({
                'success': False,
                'error': 'El nombre y apellido son obligatorios'
            }, status=400)
        
        # Guardar cambios
        admin.save()
        
        logger.info(f"Perfil de admin {admin.email} actualizado. Cambios: {'; '.join(cambios_realizados)}")
        
        return JsonResponse({
            'success': True,
            'message': f'Perfil actualizado correctamente. Cambios realizados: {len(cambios_realizados)}',
            'cambios_realizados': cambios_realizados,
            'admin': {
                'id': admin.id,
                'first_name': admin.first_name,
                'last_name': admin.last_name,
                'full_name': admin.full_name,
                'email': admin.email,
                'phone': admin.phone,
                'rol': admin.rol,
                'is_active': admin.is_active,
            }
        })
        
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Datos JSON inválidos'
        }, status=400)
        
    except Exception as e:
        logger.error(f"Error al actualizar perfil admin: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': 'Error interno del servidor'
        }, status=500)

@csrf_exempt
def listar_usuarios(request):
    """Lista todos los usuarios del sistema"""
    if request.method == 'GET':
        try:
            usuarios = User.objects.all().order_by('-date_joined')
            
            usuarios_data = []
            for usuario in usuarios:
                usuarios_data.append({
                    'id': usuario.id,
                    'first_name': usuario.first_name,
                    'last_name': usuario.last_name,
                    'full_name': usuario.full_name,
                    'email': usuario.email,
                    'phone': usuario.phone,
                    'rol': usuario.rol,
                    'is_active': usuario.is_active,
                    'date_joined': usuario.date_joined.isoformat() if usuario.date_joined else None,
                    'last_login': usuario.last_login.isoformat() if usuario.last_login else "Nunca",
                    'profile_image': usuario.get_profile_image_url(),  # ✅ Usando el método helper
                    'email_verified': usuario.email_verified,
                })
            
            return JsonResponse({
                'success': True,
                'usuarios': usuarios_data,
                'total': len(usuarios_data)
            })
            
        except Exception as e:
            logger.error(f"Error al listar usuarios: {str(e)}")
            return JsonResponse({
                'success': False,
                'error': 'Error interno del servidor'
            }, status=500)
    
    return JsonResponse({
        'success': False,
        'error': 'Método no permitido'
    }, status=405)

@csrf_exempt
@require_http_methods(["PUT"])
def editar_usuario(request, usuario_id):
    """
    Edita SOLO los campos permitidos de un usuario:
    - first_name (nombre)
    - last_name (apellido) 
    - phone (teléfono)
    
    NO permite editar: email, rol, is_active
    """
    try:
        # Obtener el usuario
        usuario = User.objects.get(id=usuario_id)
        
        # Parsear datos del request
        data = json.loads(request.body)
        
        # CAMPOS EDITABLES PERMITIDOS
        campos_permitidos = ['first_name', 'last_name', 'phone']
        
        # Validar que solo se envíen campos permitidos
        campos_enviados = list(data.keys())
        campos_no_permitidos = [campo for campo in campos_enviados if campo not in campos_permitidos]
        
        if campos_no_permitidos:
            return JsonResponse({
                'success': False,
                'error': f'Los siguientes campos no pueden ser modificados: {", ".join(campos_no_permitidos)}',
                'campos_no_permitidos': campos_no_permitidos,
                'campos_permitidos': campos_permitidos
            }, status=400)
        
        # Actualizar solo los campos permitidos
        cambios_realizados = []
        
        if 'first_name' in data:
            valor_anterior = usuario.first_name
            usuario.first_name = data['first_name'].strip()
            if valor_anterior != usuario.first_name:
                cambios_realizados.append(f"Nombre: '{valor_anterior}' → '{usuario.first_name}'")
        
        if 'last_name' in data:
            valor_anterior = usuario.last_name
            usuario.last_name = data['last_name'].strip()
            if valor_anterior != usuario.last_name:
                cambios_realizados.append(f"Apellido: '{valor_anterior}' → '{usuario.last_name}'")
        
        if 'phone' in data:
            valor_anterior = usuario.phone or ""
            usuario.phone = data['phone'].strip() if data['phone'] else None
            if valor_anterior != (usuario.phone or ""):
                cambios_realizados.append(f"Teléfono: '{valor_anterior}' → '{usuario.phone or 'Sin teléfono'}'")
        
        # Validaciones básicas
        if not usuario.first_name or not usuario.last_name:
            return JsonResponse({
                'success': False,
                'error': 'El nombre y apellido son obligatorios'
            }, status=400)
        
        # Guardar cambios
        usuario.save()
        
        logger.info(f"Usuario {usuario.email} actualizado por admin. Cambios: {'; '.join(cambios_realizados)}")
        
        return JsonResponse({
            'success': True,
            'message': f'Usuario actualizado correctamente. Cambios realizados: {len(cambios_realizados)}',
            'cambios_realizados': cambios_realizados,
            'usuario': {
                'id': usuario.id,
                'first_name': usuario.first_name,
                'last_name': usuario.last_name,
                'full_name': usuario.full_name,
                'email': usuario.email,
                'phone': usuario.phone,
                'rol': usuario.rol,
                'is_active': usuario.is_active,
            }
        })
        
    except User.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Usuario no encontrado'
        }, status=404)
        
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Datos JSON inválidos'
        }, status=400)
        
    except Exception as e:
        logger.error(f"Error al editar usuario {usuario_id}: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': 'Error interno del servidor'
        }, status=500)

@csrf_exempt
@require_http_methods(["PATCH"])
def toggle_estado_usuario(request, usuario_id):
    """
    Cambia el estado activo/inactivo de un usuario
    """
    try:
        usuario = User.objects.get(id=usuario_id)
        
        # Cambiar el estado
        usuario.is_active = not usuario.is_active
        usuario.save()
        
        accion = "habilitado" if usuario.is_active else "inhabilitado"
        
        logger.info(f"Usuario {usuario.email} {accion} por admin")
        
        return JsonResponse({
            'success': True,
            'message': f'Usuario {accion} correctamente',
            'is_active': usuario.is_active,
            'usuario': {
                'id': usuario.id,
                'full_name': usuario.full_name,
                'email': usuario.email,
                'is_active': usuario.is_active
            }
        })
        
    except User.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Usuario no encontrado'
        }, status=404)
        
    except Exception as e:
        logger.error(f"Error al cambiar estado del usuario {usuario_id}: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': 'Error interno del servidor'
        }, status=500)

@csrf_exempt
def crear_usuario(request):
    """Crear un nuevo usuario (solo para testing/admin)"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            # Validar campos requeridos
            campos_requeridos = ['email', 'first_name', 'last_name', 'password']
            for campo in campos_requeridos:
                if campo not in data or not data[campo]:
                    return JsonResponse({
                        'success': False,
                        'error': f'El campo {campo} es obligatorio'
                    }, status=400)
            
            # Crear usuario usando tu UserManager
            usuario = User.objects.create_user(
                email=data['email'].lower(),
                first_name=data['first_name'].strip(),
                last_name=data['last_name'].strip(),
                password=data['password'],
                phone=data.get('phone', '').strip() or None,
                rol=data.get('rol', 'usuario')
            )
            
            return JsonResponse({
                'success': True,
                'message': 'Usuario creado correctamente',
                'usuario': {
                    'id': usuario.id,
                    'email': usuario.email,
                    'full_name': usuario.full_name,
                    'rol': usuario.rol
                }
            })
            
        except IntegrityError:
            return JsonResponse({
                'success': False,
                'error': 'Ya existe un usuario con ese email'
            }, status=400)
            
        except json.JSONDecodeError:
            return JsonResponse({
                'success': False,
                'error': 'Datos JSON inválidos'
            }, status=400)
            
        except Exception as e:
            logger.error(f"Error al crear usuario: {str(e)}")
            return JsonResponse({
                'success': False,
                'error': 'Error interno del servidor'
            }, status=500)
    
    return JsonResponse({
        'success': False,
        'error': 'Método no permitido'
    }, status=405)
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
@permission_classes([AllowAny])
def logout_user(request):
    """Logout con JWT (blacklist refresh token)"""
    refresh_token = request.data.get("refresh")
    if not refresh_token:
        return Response({'error': 'No se proporcionó refresh token'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({'message': 'Logout exitoso'})
    except Exception as e:
        return Response({'error': f'Error al hacer logout: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)



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


# -------------------------------------------------------------------
# 🔹 ACTUALIZAR PERFIL Y CAMBIAR CONTRASEÑA
# -------------------------------------------------------------------

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    """Actualizar información del perfil del usuario autenticado"""
    try:
        user = request.user
        data = request.data

        # Campos que se pueden actualizar (sin email)
        if 'first_name' in data:
            user.first_name = data['first_name'].strip()
        
        if 'last_name' in data:
            user.last_name = data['last_name'].strip()
        
        if 'phone' in data:
            user.phone = data['phone'].strip()

        user.save()

        return Response({
            'success': True,
            'message': 'Perfil actualizado correctamente',
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'phone': getattr(user, 'phone', ''),
                'email_verified': getattr(user, 'email_verified', False),
            }
        })

    except Exception as e:
        return Response({
            'success': False,
            'error': f'Error al actualizar perfil: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """Cambiar contraseña del usuario autenticado"""
    try:
        user = request.user
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')
        confirm_password = request.data.get('confirm_password')

        # Validaciones
        if not current_password or not new_password or not confirm_password:
            return Response({
                'success': False,
                'error': 'Todos los campos son requeridos'
            }, status=status.HTTP_400_BAD_REQUEST)

        if new_password != confirm_password:
            return Response({
                'success': False,
                'error': 'Las contraseñas nuevas no coinciden'
            }, status=status.HTTP_400_BAD_REQUEST)

        if len(new_password) < 6:
            return Response({
                'success': False,
                'error': 'La contraseña debe tener al menos 6 caracteres'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Verificar contraseña actual
        if not user.check_password(current_password):
            return Response({
                'success': False,
                'error': 'La contraseña actual es incorrecta'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Cambiar contraseña
        user.set_password(new_password)
        user.save()

        return Response({
            'success': True,
            'message': 'Contraseña cambiada correctamente'
        })

    except Exception as e:
        return Response({
            'success': False,
            'error': f'Error al cambiar contraseña: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)