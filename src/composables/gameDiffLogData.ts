export type ObjectKString = { [k: string]: unknown }

export default function gameDiffLogData() {
    return {
        createDiff,
        isObject,
        addMetadata,
        limit,
    };

    function createDiff(parent: object, obj: object): object|null {
        class Cell {
            constructor(public data: unknown = null, public status: string = 'unknown') {}
        }

        if (isObject(parent)) {
            const [res, topLevel] = compareObject(parent as ObjectKString, obj as ObjectKString);

            if (res || topLevel) {
                return combineObjects(res || {}, topLevel || {});
            }
        }
        return null;

        function compareObject(parent: ObjectKString, obj: ObjectKString): [{[k: string]: Cell}|null, ObjectKString|null] {
            const stats: {[k: string]: Cell} = {};
            let topLevel: ObjectKString = {};

            for (const key in parent) {
                if (key in parent) {
                    const cell = stats[key] = new Cell();

                    if (key in obj) {
                        const parentElem = parent[key];
                        const objElem = obj[key];

                        if (isObject(parentElem)) {
                            const [child, topLvl] = compareObject(parentElem as ObjectKString, objElem as ObjectKString);

                            if (child || topLvl) {
                                cell.status = 'modified';

                                if (child) {
                                    cell.data = child;
                                } else {
                                    delete stats[key];
                                }
                                if (topLvl) {
                                    topLevel = {
                                        ...topLevel,
                                        [key]: topLvl,
                                    };
                                }
                            } else {
                                delete stats[key];
                            }

                            continue;
                        }
                        if (Array.isArray(parentElem)) {
                            const parent: unknown[] = topLevel[key] = [...parentElem];
                            const separator: string[] = topLevel[`__>>${key}`] = Array.from({ length: parentElem.length }, () => '>>');

                            if (Array.isArray(objElem)) {
                                if (!isEqualArrays(parentElem, objElem) && !isObject(objElem[0])) {
                                    const target: unknown[] = topLevel[`_${key}`] = [...objElem];

                                    if (objElem.length > parentElem.length) {
                                        const length = objElem.length - parentElem.length;

                                        parent.push(...Array.from({ length }, () => null));
                                        separator.push(...Array.from({ length }, () => '>>'));
                                    }

                                    for (const i in separator) {
                                        if (
                                            (Array.isArray(parent[i]) && Array.isArray(target[i]) && isEqualArrays(parent[i] as unknown[], target[i] as unknown[])) ||
                                            (parent[i] == target[i])
                                        ) {
                                            parent[i] = null;
                                            target[i] = null;
                                        }
                                    }
                                } else {
                                    delete topLevel[key];
                                    delete topLevel[`__>>${key}`];
                                }
                            } else {
                                topLevel[`_${key}`] = Array.from({ length: parentElem.length }, () => objElem);
                            }

                            delete stats[key];
                            continue;
                        }
                        if (parentElem !== objElem) {
                            cell.status = 'modified';
                            cell.data = [parentElem, objElem];
                        }
                    } else {
                        if (Array.isArray(parent[key])) {
                            const value = parent[key] as unknown[];

                            topLevel[key] = [...value];
                            topLevel[`__>>${key}`] = Array.from({ length: value.length }, () => '>>');
                            topLevel[`_${key}`] = Array.from({ length: value.length }, () => null);
                        } else {
                            cell.status = 'deleted';
                            cell.data = parent[key];
                        }
                    }


                    if (cell.status == 'unknown') {
                        delete stats[key];
                    }
                }
            }

            if (!isEqualArrays(Object.keys(parent), Object.keys(obj))) {
                Object.keys(obj)
                    .filter((k) => !(k in parent))
                    .forEach((k) => {
                        const value = obj[k];

                        if (Array.isArray(value)) {
                            topLevel[k] = Array.from({ length: value.length }, () => null);
                            topLevel[`__>>${k}`] = Array.from({ length: value.length }, () => '>>');
                            topLevel[`_${k}`] = [...value];
                        } else {
                            stats[k] = new Cell(obj[k], 'added');
                        }
                    });
            }

            return [
                (Object.keys(stats).length) ? stats : null,
                (Object.keys(topLevel).length) ? topLevel : null,
            ];
        }

        function isEqualArrays(arr1: unknown[], arr2: unknown[]): boolean {
            if (arr1.length != arr2.length) {
                return false;
            }
            return arr1.every((e, i) => {
                if (Array.isArray(e) && Array.isArray(arr2[i])) {
                    return isEqualArrays(e, arr2[i] as unknown[]);
                }
                return e === arr2[i];
            });
        }
    }

    function addMetadata(target: {[k: string]: unknown}, sources: {[k: string]: unknown}[], filename: string) {
        for (const key in target) {
            if (key in target) {
                const sourcesByKey = sources.map((src) => src[key]);
                const filtered = sourcesByKey.filter(isObject);

                if (isObject(target[key]) && filtered.length) {
                    addMetadata(target[key] as typeof target, filtered as typeof sources, filename);
                }

                sources.forEach((src) => {
                    if (isObject(src)) {
                        ['TID', 'Icon', 'Name']
                            .filter((k) => k in src && !(k in target))
                            .forEach((k) => target[k] = src[k]);
                    }

                    const needNameKey = Object.values(target).some((e) => !isObject(e));
                    if (needNameKey) {
                        ['Name', 'TID']
                            .filter((k) => typeof target[k] != 'string')
                            .forEach((k) => {
                                if (Array.isArray(target[k])) {
                                    target[`${k}2`] = [...target[k] as string[]];
                                }
                                target[k] = filename;
                            });
                    }
                });
            }
        }

        return target;
    }

    function isObject(elem: unknown) {
        return typeof elem == 'object' && !Array.isArray(elem) && elem != null;
    }

    async function limit(tasks: (() => unknown)[], concurrency = 2) {
        async function runTasks(tasksIterator: (() => unknown)[]) {
            for (const task of tasksIterator) {
                await task();
            }
        }

        const workers = new Array(concurrency).fill(tasks).map(runTasks);

        await Promise.all(workers);
    }

    function combineObjects(target: object, ...sources: object[]): object {
        if (!sources.length) return target;
        const source = sources.shift();

        if (isObject(target) && isObject(source)) {
            for (const key in source) {
                if (isObject((source as ObjectKString)[key])) {
                    if (!(target as ObjectKString)[key]) Object.assign(target, { [key]: {} });
                    combineObjects((target as { [k: string]: object })[key], (source as { [k: string]: object })[key]);
                } else {
                    Object.assign(target, { [key]: (source as ObjectKString)[key] });
                }
            }
        }

        return combineObjects(target, ...sources);
    }
}
