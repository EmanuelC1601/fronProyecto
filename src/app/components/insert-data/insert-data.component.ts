import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { ApiService, ApiResponse, Registro } from '../../services/api.service';

@Component({
  selector: 'app-insert-data',
  templateUrl: './insert-data.component.html',
  styleUrls: ['./insert-data.component.css']
})
export class InsertDataComponent implements OnInit {
  insertForm: FormGroup;
  captchaResolved = false;
  isSubmitting = false;
  showSuccess = false;
  showError = false;
  errorMessage = '';
  generatedPassword = '';
  generatedSerie = 0;
  
  // Propiedad para la fecha actual
  todayDate = new Date();
  
  // Google reCAPTCHA site key (clave de prueba)
  readonly siteKey = '6LeGq1osAAAAAGy_pTD_MCTXnuoyV7CnooZu0qoL';

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService
  ) {
    this.insertForm = this.fb.group({
      usuario: ['', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(12),
        this.noWhitespaceValidator(),
        this.lettersOnlyValidator(),
        this.noNumbersValidator(),
        this.noSpecialCharsValidator()
      ]],
      recaptcha: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Actualizar la fecha cada segundo para mostrar la hora actual
    setInterval(() => {
      this.todayDate = new Date();
    }, 1000);
  }

  // Validador personalizado: no espacios en blanco
  noWhitespaceValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const hasWhitespace = /\s/.test(control.value);
      return hasWhitespace ? { 'whitespace': { value: control.value } } : null;
    };
  }

  // Validador personalizado: solo letras (incluye tildes y ñ)
  lettersOnlyValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!control.value) return null;
      
      const lettersOnly = /^[A-Za-zÁÉÍÓÚáéíóúÑñ]*$/.test(control.value);
      return !lettersOnly ? { 'lettersOnly': { value: control.value } } : null;
    };
  }

  // Validador personalizado: no números
  noNumbersValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!control.value) return null;
      
      const hasNumbers = /\d/.test(control.value);
      return hasNumbers ? { 'hasNumbers': { value: control.value } } : null;
    };
  }

  // Validador personalizado: no caracteres especiales
  noSpecialCharsValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!control.value) return null;
      
      // Permitimos solo letras, tildes y ñ
      const hasSpecialChars = /[^A-Za-zÁÉÍÓÚáéíóúÑñ]/.test(control.value);
      return hasSpecialChars ? { 'hasSpecialChars': { value: control.value } } : null;
    };
  }

  // Generar contraseña aleatoria
  generateRandomPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  // Generar número de serie aleatorio
  generateRandomSerie(): number {
    return Math.floor(Math.random() * 9000) + 1000; // Entre 1000 y 9999
  }

  // Método para manejar input del usuario
  onUsuarioInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;
    
    // Eliminar espacios automáticamente
    value = value.replace(/\s/g, '');
    
    // Eliminar números automáticamente
    value = value.replace(/\d/g, '');
    
    // Eliminar caracteres especiales automáticamente
    value = value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ]/g, '');
    
    // Limitar a 12 caracteres
    if (value.length > 12) {
      value = value.substring(0, 12);
    }
    
    // Actualizar el valor del control
    this.insertForm.get('usuario')?.setValue(value, { emitEvent: false });
    
    // Si el captcha ya está resuelto, regenerar valores automáticos
    if (this.captchaResolved && this.insertForm.get('usuario')?.valid) {
      this.generatedPassword = this.generateRandomPassword();
      this.generatedSerie = this.generateRandomSerie();
    }
  }

  onCaptchaResolved(captchaResponse: string): void {
    this.captchaResolved = true;
    this.insertForm.get('recaptcha')?.setValue(captchaResponse);
    
    // Cuando se resuelve el captcha, generar los valores automáticos
    if (this.insertForm.get('usuario')?.valid) {
      this.generatedPassword = this.generateRandomPassword();
      this.generatedSerie = this.generateRandomSerie();
    }
  }

  // Método cuando el captcha expira
  onCaptchaExpired(): void {
    this.captchaResolved = false;
    this.insertForm.get('recaptcha')?.setValue('');
    this.generatedPassword = '';
    this.generatedSerie = 0;
  }

  // Método cuando el captcha se carga
  onCaptchaLoaded(): void {
    console.log('Captcha cargado correctamente');
  }

  // Método para mostrar mensajes de error personalizados
  getErrorMessage(controlName: string): string {
    const control = this.insertForm.get(controlName);
    
    if (!control || !control.errors || !control.touched) return '';

    if (control.errors['required']) {
      return 'Este campo es requerido';
    }
    
    if (control.errors['whitespace']) {
      return 'No se permiten espacios en blanco';
    }
    
    if (control.errors['lettersOnly']) {
      return 'Solo se permiten letras (A-Z, a-z, tildes y ñ)';
    }
    
    if (control.errors['hasNumbers']) {
      return 'No se permiten números';
    }
    
    if (control.errors['hasSpecialChars']) {
      return 'No se permiten caracteres especiales';
    }
    
    if (control.errors['minlength']) {
      return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;
    }
    
    if (control.errors['maxlength']) {
      return `Máximo ${control.errors['maxlength'].requiredLength} caracteres`;
    }

    return '';
  }

  onSubmit(): void {
    if (this.insertForm.invalid) {
      this.markFormGroupTouched(this.insertForm);
      return;
    }

    this.isSubmitting = true;
    this.showSuccess = false;
    this.showError = false;

    // Generar valores automáticos si no se han generado
    if (!this.generatedPassword) {
      this.generatedPassword = this.generateRandomPassword();
    }
    
    if (!this.generatedSerie) {
      this.generatedSerie = this.generateRandomSerie();
    }

    const formData = {
      usuario: this.insertForm.value.usuario,
      password: this.generatedPassword,
      serie: this.generatedSerie
    };

    // Llamar al backend real
    this.apiService.insertData(formData).subscribe({
      next: (response: ApiResponse<Registro>) => {
        this.isSubmitting = false;
        this.showSuccess = true;
        
        // Crear mensaje con los datos insertados
        const successMessage = document.createElement('div');
        successMessage.className = 'alert alert-success alert-dismissible fade show position-fixed top-0 end-0 m-3';
        successMessage.style.zIndex = '1050';
        successMessage.innerHTML = `
          <i class="bi bi-check-circle-fill me-2"></i>
          <strong>¡Éxito!</strong> Datos insertados:<br>
          <small>Usuario: ${formData.usuario}<br>
          Serie: ${formData.serie}<br>
          Fecha: ${new Date().toLocaleString()}</small>
          <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(successMessage);
        
        // Auto-eliminar después de 5 segundos
        setTimeout(() => {
          successMessage.remove();
        }, 5000);

        // Limpiar formulario
        this.clearForm();
      },
      error: (error: Error) => {
        this.isSubmitting = false;
        this.showError = true;
        this.errorMessage = error.message || 'Error al insertar datos. Intenta nuevamente.';
        
        // Crear mensaje de error
        const errorMessage = document.createElement('div');
        errorMessage.className = 'alert alert-danger alert-dismissible fade show position-fixed top-0 end-0 m-3';
        errorMessage.style.zIndex = '1050';
        errorMessage.innerHTML = `
          <i class="bi bi-exclamation-triangle-fill me-2"></i>
          <strong>Error:</strong> ${this.errorMessage}
          <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(errorMessage);
        
        // Auto-eliminar después de 5 segundos
        setTimeout(() => {
          errorMessage.remove();
        }, 5000);
      }
    });
  }

  // Método para limpiar formulario completamente
  clearForm(): void {
    this.insertForm.reset();
    this.captchaResolved = false;
    this.generatedPassword = '';
    this.generatedSerie = 0;
    this.showSuccess = false;
    this.showError = false;
    
    // Recargar el captcha
    if (typeof (window as any).grecaptcha !== 'undefined') {
      (window as any).grecaptcha.reset();
    }
  }

  // Contador de caracteres
  getCharacterCount(): number {
    return this.insertForm.get('usuario')?.value?.length || 0;
  }

  // Verificar si se acerca al límite
  isNearLimit(): boolean {
    const count = this.getCharacterCount();
    return count >= 10 && count <= 12;
  }

  // Verificar si excede el límite
  isOverLimit(): boolean {
    return this.getCharacterCount() > 12;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
