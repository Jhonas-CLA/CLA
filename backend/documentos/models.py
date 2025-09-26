from django.db import models

class Documento(models.Model):
    TIPOS_DOCUMENTO = [
        ('pdf', 'PDF'),
        ('doc', 'Word DOC'),
        ('docx', 'Word DOCX'),
        ('xls', 'Excel XLS'),
        ('xlsx', 'Excel XLSX'),
        ('jpg', 'Imagen JPG'),
        ('jpeg', 'Imagen JPEG'),
        ('png', 'Imagen PNG'),
    ]
    
    nombre = models.CharField(max_length=255)
    descripcion = models.TextField(blank=True, null=True)
    tipo = models.CharField(max_length=10, choices=TIPOS_DOCUMENTO)
    archivo = models.FileField(upload_to='documentos/')
    fecha_subida = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-fecha_subida']
        verbose_name = 'Documento'
        verbose_name_plural = 'Documentos'
    
    def __str__(self):
        return self.nombre