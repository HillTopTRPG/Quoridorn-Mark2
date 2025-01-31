/**
 * 合計値を算出する
 *
 * @param list
 */
export function sum(list: number[]): number {
  return list.reduce((accumlator, current) => accumlator + current, 0);
}

/**
 * 平均を算出する
 *
 * @param list
 */
export function average(list: number[]): number | null {
  if (!list.length) return null;
  return sum(list) / list.length;
}

/**
 * クローンを生成する
 * @param obj
 */
export function clone<T>(obj: T | null): T | null {
  if (!obj) return obj;
  return JSON.parse(JSON.stringify(obj)) as T;
}

/**
 * 文字列を数値に変換する
 * 変換できない場合は null を返却する
 * @param str
 * @param radix
 */
export function convertNumberNull(
  str: string | null,
  radix: number = 10
): number | null {
  if (!str) return null;
  str = str.trim().replace(/^\+/, "");
  if (radix === 16 && /^-?[0-9a-fA-F]+$/.test(str)) return parseInt(str, 16);
  if (radix === 10 && /^-?[0-9]+$/.test(str)) return parseInt(str, radix);
  if (radix === 10 && /^-?[0-9]*\.[0-9]+$/.test(str)) return parseFloat(str);
  return null;
}

/**
 * 文字列を数値に変換する
 * 変換できない場合は 0 を返却する
 * @param str
 * @param radix
 */
export function convertNumberZero(
  str: string | null,
  radix: number = 10
): number {
  return convertNumberNull(str, radix) || 0;
}

/**
 * 文字列をbooleanに変換する
 * 変換できない場合は false を返却する
 * @param str
 */
export function convertBooleanFalse(str: string | null): boolean {
  if (str === null) return false;
  return str.toLowerCase() === "true";
}
export function convertBooleanNull(str: string | null): boolean | null {
  if (str === null) return null;
  if (str.toLowerCase() === "true") return true;
  if (str.toLowerCase() === "false") return false;
  return null;
}

export function isArray(obj: any): boolean {
  return Object.prototype.toString.call(obj) === "[object Array]";
}

/**
 * 配列を空にする
 * @param list
 */
export function listToEmpty(list: Array<unknown>) {
  list.splice(0, list.length);
}

/**
 * リストから特定の要素を削除する
 *
 * @param list
 * @param filterFunc
 */
export function listDelete(
  list: any[],
  filterFunc: (item: any, index: number) => {}
) {
  const deleteList: any[] = list.filter(filterFunc);
  const deleteIndexList: number[] = deleteList.map(deleteItem =>
    list.indexOf(deleteItem)
  );
  deleteIndexList.sort((n1: number, n2: number) => {
    if (n1 > n2) return -1;
    if (n1 < n2) return 1;
    return 0;
  });
  deleteIndexList.forEach(deleteIndex => list.splice(deleteIndex, 1));
}

/**
 * URLパラメータ取得処理
 *
 * @param name
 * @param url
 */
export function getUrlParam(
  name: string,
  url: string = window.location.href
): string | null {
  name = name.replace(/[[\]]/g, "\\$&");
  const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
  let results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/(\+)|(¥%20)/g, " "));
}

/**
 * ゼロパディング処理
 *
 * @param num
 * @param length
 */
export function zeroPadding(num: number | string, length: number): string {
  return ("0".repeat(length) + num).slice(-length);
}

/**
 * 拡張子を除去する
 *
 * @param fileName
 */
export function removeExt(fileName: string): string {
  const matchExt: string[] | null = fileName.match(/(.*)(?:\.([^.]+$))/);
  return matchExt ? matchExt[1] : fileName;
}

/**
 * 拡張子を取得する
 *
 * @param fileName
 */
export function getExt(fileName: string): string {
  const matchExt: string[] | null = fileName.match(/[^.]+$/);
  return matchExt ? matchExt[0] : "";
}

/**
 * ファイル名を取得する
 *
 * @param url
 */
export function getFileName(url: string): string {
  const matchExt: string[] | null = url.match(/[^/]+$/);
  return matchExt ? matchExt[0] : "";
}

export function hoseiStr(n: number): string {
  return n > 0 ? `+${n}` : n.toString(10);
}

export function match(
  text: string,
  regexp: RegExp | string,
  callback: (matchResult: RegExpMatchArray) => void
): void {
  const matchResult = text.match(regexp);
  matchResult && callback(matchResult);
}
