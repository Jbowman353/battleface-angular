import { AbstractControl, FormControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validator to check that a date is after another
 * @param after - Date Form Control which should be validated against as the minimum value
 */
export function dateAfterValidator(after: FormControl): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        return control.value - after.value > 0 ? null : {invalidRange: true}
    }
}

/**
 * Validator to check that a date is before another
 * @param before - Date Form Control which should be validated against as the maximum value
 */
export function dateBeforeValidator(before: FormControl): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        return control.value - before.value < 0 ? null : {invalidRange: true}
    }
}