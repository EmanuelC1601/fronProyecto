import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  showSuccess: boolean = false;
  showError: boolean = false;
  errorMessage: string = '';
  isSubmitting: boolean = false;
  letrasUsadas: number = 0;
  
  // Contraseñas generadas automáticamente
  private generatedPassword: string = '';
  private generatedConfirmPassword: string = '';
  
  constructor(private fb: FormBuilder, private apiService: ApiService) {
    // Generar contraseñas automáticas
    this.generatePasswords();
    
    this.registerForm = this.fb.group({
      nombre: ['', [
        Validators.required,
        Validators.maxLength(50),
        Validators.minLength(2),
        this.soloLetrasValidator(),
        this.sinEspaciosExtremosValidator(),
        this.maxPalabrasValidator(3),
        this.maxLetrasNombreValidator(12)
      ]],
      fechaNacimiento: ['', [
        Validators.required,
        this.fechaNacimientoValidator()
      ]]
    });

    // Suscribirse a cambios en el campo nombre para contar letras en tiempo real
    this.registerForm.get('nombre')?.valueChanges.subscribe((value) => {
      this.letrasUsadas = this.contarLetras(value);
    });
  }

  ngOnInit(): void {}

  // Getter para fácil acceso a los controles del formulario
  get f() {
    return this.registerForm.controls;
  }

  // Propiedad para la fecha actual
  get today(): Date {
    return new Date();
  }

  /** GENERAR CONTRASEÑAS AUTOMÁTICAS */
  private generatePasswords(): void {
    // Generar una contraseña aleatoria de 12 caracteres
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    this.generatedPassword = password;
    this.generatedConfirmPassword = password; // Misma contraseña para confirmación
    
    console.log('🔑 Contraseñas generadas automáticamente:', {
      password: this.generatedPassword,
      confirmPassword: this.generatedConfirmPassword
    });
  }

  /** MÉTODOS PARA EL NOMBRE */

  // Método para contar letras (sin espacios)
  contarLetras(nombre: string): number {
    if (!nombre) return 0;
    return nombre.replace(/\s+/g, '').length;
  }

  // Método para formatear nombre (primera letra mayúscula)
  formatearNombre(event: any) {
    const input = event.target;
    let valor = input.value;
    
    // Guardar posición del cursor
    const startPos = input.selectionStart;
    const endPos = input.selectionEnd;
    
    // Convertir a formato título (primera letra de cada palabra mayúscula)
    const palabras = valor.split(' ');
    const palabrasFormateadas = palabras.map((palabra: string) => {
      if (palabra.length > 0) {
        return palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase();
      }
      return '';
    });
    
    const valorFormateado = palabrasFormateadas.join(' ');
    
    // Actualizar el valor en el formulario si cambió
    if (valor !== valorFormateado) {
      this.registerForm.get('nombre')?.setValue(valorFormateado, { emitEvent: true });
      
      // Restaurar posición del cursor después de un pequeño delay
      setTimeout(() => {
        input.setSelectionRange(startPos, endPos);
      }, 0);
    }
  }

  // Método para mostrar contador de letras con colores
  getColorContador(): string {
    const maxLetras = 12;
    if (this.letrasUsadas > maxLetras) {
      return 'text-danger';
    } else if (this.letrasUsadas > maxLetras * 0.8) {
      return 'text-warning';
    } else {
      return 'text-success';
    }
  }

  /** VALIDACIONES PARA NOMBRE */

  // 1. Validación: Solo letras (incluye Ññ y acentos)
  soloLetrasValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value || control.value.trim() === '') return null;
      
      // Permite letras, espacios, Ññ, y acentos comunes en español
      const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(control.value);
      return !soloLetras ? { soloLetras: true } : null;
    };
  }

  // 2. Validación: No espacios al inicio o final
  sinEspaciosExtremosValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const valor = control.value.toString();
      const tieneEspaciosInicio = valor.startsWith(' ');
      const tieneEspaciosFinal = valor.endsWith(' ');
      
      if (tieneEspaciosInicio || tieneEspaciosFinal) {
        return { espaciosExtremos: true };
      }
      return null;
    };
  }

  // 3. Validación: Máximo número de palabras
  maxPalabrasValidator(maxPalabras: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const palabras = control.value.trim().split(/\s+/).filter((word: string) => word.length > 0);
      
      if (palabras.length > maxPalabras) {
        return { maxPalabras: { max: maxPalabras, actual: palabras.length } };
      }
      return null;
    };
  }

  // 4. Validación: Máximo 12 letras (sin contar espacios)
  maxLetrasNombreValidator(maxLetras: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      // Quitar todos los espacios y contar letras
      const letrasSinEspacios = control.value.replace(/\s+/g, '');
      
      if (letrasSinEspacios.length > maxLetras) {
        return { maxLetras: { max: maxLetras, actual: letrasSinEspacios.length } };
      }
      return null;
    };
  }

  // 5. Validación: Fecha de nacimiento (no futura y mayor de 13 años)
  fechaNacimientoValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const selectedDate = new Date(control.value);
      const today = new Date();
      
      // Check if the date is valid
      if (isNaN(selectedDate.getTime())) {
        return { invalidDate: 'La fecha no es válida' };
      }
      
      // Check if the date is in the future
      if (selectedDate > today) {
        return { invalidDate: 'La fecha no puede ser en el futuro' };
      }
      
      // Check if the user is at least 13 years old
      const minAgeDate = new Date();
      minAgeDate.setFullYear(today.getFullYear() - 13);
      
      if (selectedDate > minAgeDate) {
        return { invalidDate: 'Debes tener al menos 13 años' };
      }
      
      return null;
    };
  }

  onSubmit() {
    // Resetear estados
    this.showError = false;
    this.errorMessage = '';
    
    // Marcar todos los controles como tocados
    this.registerForm.markAllAsTouched();

    if (this.registerForm.invalid) {
      this.errorMessage = 'Por favor, corrige los errores en el formulario.';
      this.showError = true;
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Enviar datos al backend
    this.enviarDatos();
  }

  private enviarDatos() {
    this.isSubmitting = true;
    
    // Preparar datos para enviar al backend
    const userData = {
      usuario: this.registerForm.get('nombre')?.value.trim(),
      fechaNacimiento: this.registerForm.get('fechaNacimiento')?.value,
      password: this.generatedPassword,
      confirmPassword: this.generatedConfirmPassword
    };
    
    console.log('📤 Enviando datos de registro:', userData);
    
    // Usar el ApiService para enviar al backend
    this.apiService.registerUser(userData).subscribe({
      next: (response: any) => {
        console.log('✅ Respuesta del backend:', response);
        
        this.isSubmitting = false;
        this.showSuccess = true;
        this.showError = false;
        
        // Mostrar información de contraseña generada
        alert(`¡Usuario registrado exitosamente!\n\nContraseña generada automáticamente: ${this.generatedPassword}\n\n(Guarda esta contraseña en un lugar seguro)`);
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Limpiar formulario después de 5 segundos
        setTimeout(() => {
          this.limpiarFormulario();
          this.showSuccess = false;
          this.generatePasswords(); // Generar nuevas contraseñas para el próximo registro
        }, 5000);
      },
      error: (error: any) => {
        console.error('❌ Error del backend:', error);
        
        this.isSubmitting = false;
        this.showError = true;
        this.errorMessage = error.message || 'Error al registrar el usuario. Por favor, intenta nuevamente.';
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  // Método para limpiar el formulario
  limpiarFormulario() {
    this.registerForm.reset();
    this.letrasUsadas = 0;
    const inputs = document.querySelectorAll('.is-invalid');
    inputs.forEach(input => {
      input.classList.remove('is-invalid');
    });
  }
}