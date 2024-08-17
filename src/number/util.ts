/**
  * isNumber return if a specified text is a valid numeric value.
  *
  * @param v - The string to check if is a number.
  */
export function isNumber(v: string): boolean {
  // If `v` is not a valid numeric value then `Number(v)` will be NaN.
  // Is important to check for NaN values using Number.isNaN and not `==` nor `===`.
  return !Number.isNaN(Number(v)) && v !== ''; 
}
