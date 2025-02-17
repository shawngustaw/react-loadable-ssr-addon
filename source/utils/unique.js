/**
 * react-loadable-ssr-addon
 * @author Marcos Gonçalves <contact@themgoncalves.com>
 * @version 0.3.0
 */

/**
 * Clean array to unique values
 * @method unique
 * @function
 * @param {array} array - Array to be inspected
 * @returns {array} - Array with unique values
 */
export default function unique(array) {
  return array.filter((elem, pos, arr) => arr.indexOf(elem) === pos);
}
