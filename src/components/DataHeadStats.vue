<template>
  <div>
    <template v-if="isObject(items) || (Array.isArray(items) && items.every(isObject))">
      <div class="wrapper">

        <div
          v-for="(item, name) of itemsToArray"
          :key="name"
          class="item"
        >
          <div class="body">
            <div class="meta">
              <div class="text-side">
                <div
                  v-if="name || item.TID"
                  :id="parentId ? `${parentId}-${name}` : item.Name"
                  class="title"
                >
                  <a :href="parentId ? `#${parentId}-${name}` : `#${item.Name}`">
                    {{ formatTitle(name, item.TID) }}
                  </a>
                </div>
                <p
                  v-if="item.TID_Description && (parent.TID_Description ? parent.TID_Description !== item.TID_Description : true) && $te(item.TID_Description)"
                  class="description"
                >
                  {{ formatDescr(item.TID_Description) }}
                </p></div>

              <div
                v-if="item.PrefabModel || item.Icon || item.Model"
                class="icon"
              >
                <icon
                  :name="item.PrefabModel || item.Icon || item.Model"
                  :dir="iconDir || ICON_DIR_LIST[name] || ICON_DIR_LIST.default"
                />
              </div>
            </div>

            <template v-if="Array.isArray(item) && item.every((e) => e !== Object(e))">
              {{ format.value(name, item) }}
            </template>
            <ul
              v-else
              class="characteristics"
            >
              <li
                v-for="([value, filtered], key) in getCharacteristics(item)"
                :key="key"
                :class="{'line': true, filtered}"
              >
                <!--suppress HtmlUnknownTag -->
                <DataHeadStats
                  :item-key="key"
                  :items="value"
                  :format="format"
                  :parent-id="`${parentId}-${name}`"
                  :parent="item"
                />
              </li>
            </ul>
          </div>
        </div>

      </div>
    </template>

    <template v-else>
      <b>
        <DataStatTooltip :k="itemKey">
          {{ format.key(itemKey) }}
        </DataStatTooltip>
      </b>
      <template v-if="$store.state.userSettings.showKeys"> ({{ itemKey }})</template>:

      <v-node
        v-if="typeof format.value(itemKey, items) === 'function'"
        :render="format.value(itemKey, items)"
      />
      <span
        v-else
        :class="statsStyleName(itemKey)"
        class="value stats-style"
      >
        {{ format.value(itemKey, items) }}
      </span>

      <slot />

    </template>

  </div>
</template>

<script lang="ts">
import objectArrayify from '@Utils/objectArrayify';
import isHide from '@Handlers/isHide';
import Store from '@/store';

function getCharacteristics(d: Record<string, unknown>): object {
    const res = objectArrayify(d, {
        map: ([k, value]) => [
            k,
            [
                value,
                isHide(k, d.Name as string),
            ],
        ],
        filter: ([k, [, remove]]) => (
            k.startsWith('_') || isHide(k, null, { asMeta: true, asTitle: false }) ? false : (Store.state.userSettings.disableFilters ? true : !remove)
        ),
    }) as Record<string, [unknown|string, boolean]>;

    if (d.projectile) { // перенести вниз
        const { projectile } = res;
        delete res.projectile;
        res.projectile = projectile;
    }
    return res;
}

export {
    getCharacteristics as getCharsWithHideStatus,
};
</script>

<script setup lang="ts">
import { h, computed } from 'vue';
import Icon from '@/components/Icon.vue';
import DataStatTooltip from '@/components/DataStatTooltip.vue';
import i18n from '@Utils/Vue/i18n';

import statsStyleName from '@Handlers/statsStyleName';
import locKeys from '@Regulation/locKeys.mjs';

export interface Props {
    items: unknown[] | unknown | { [k:string]: object|unknown[] },
    format: { key: (k: string) => string, value: (k: string, v: unknown) => string }
    itemKey?: string|null
    parentId?: string|null
    parent?: object
    iconDir?: string
}

const ICON_DIR_LIST = {
    drone: 'game/Ships',
    modules: 'game/Modules',
    default: 'game/Modules',
};

const { t, te } = i18n.global;
const props = withDefaults(defineProps<Props>(), {
    itemKey: null,
    parentId: null,
    parent: () => ({ ID_Description: null }),
    iconDir: '',
});
const itemsToArray = computed(() => {
    if (Array.isArray(props.items)) {
        return props.items;
    }
    if (isObject(props.items) && Object.values(props.items).every((e) => isObject(e) || Array.isArray(e))) {
        return props.items;
    }
    return [props.items];
});

function isObject(o: unknown): boolean {
    return (typeof o === 'object' && !Array.isArray(o) && o !== null);
}
function formatDescr(descrKey: string): string {
    const customDescrKey = descrKey.endsWith('_DESCR') ? descrKey.replace('_DESCR', '_CUSTOM_DESCR') : null;
    const descr = t(descrKey, ['X', 'Y', 'Z']).replace(/<[^>]*>/g, '');
    const customDescr = (customDescrKey && te(customDescrKey)) ? t(customDescrKey) : null;

    return (customDescr) ? `${descr}\n\n${customDescr}` : descr;
}
function formatTitle(keyName: string, TID: string) {
    const finalKey = (TID) ? ((keyName in locKeys) ? keyName : TID) : keyName;

    return props.format.key(finalKey);
}

function VNode({ render }) {
    return render(h);
}
</script>

<style scoped lang="scss">
@import "../style/vars";

$mw: 900px;

.wrapper {
    margin-top: 2%;
    display: flex;
    gap: 2%;

    @media screen and (max-width: $mw) {
        flex-direction: column;
    }

    .item {
        background-color: #2e3f46;
        width: 100%;
        border-radius: 10px;

        @media screen and (max-width: $mw) {
            width: auto;
            margin-top: 3%;
            border-radius: 7px;
        }

        .body {
            padding: 2%;
            width: 96%;

            .meta {
                display: flex;

                .text-side {
                    flex: 9;

                    .title {
                        margin-bottom: 1%;
                        font-size: 170%;

                        @media screen and (max-width: $mw) {
                            font-size: 140%;
                        }

                        a {
                            color: #ccd7de;
                        }
                    }

                    .description {
                        white-space: pre-line;
                        font-size: 120%;
                        padding-bottom: 3%;

                        @media screen and (max-width: $mw) {
                            font-size: 90%;
                        }
                    }
                }

                .icon {
                    flex: 2;
                    margin: 1%;
                    max-width: 140px;

                    @media screen and (max-width: $mw) {
                        max-width: none;
                    }
                }
            }
            .characteristics {
                list-style-type: none;

                .line {
                    font-size: 100%;
                    padding: 2px 0;

                    @media screen and (max-width: $mw) {
                        font-size: 90%;
                    }
                    &.filtered {
                        background-color: rgba(220,20,60, 0.2);
                    }

                    span.value.stats-style {
                        display: inline-flex;
                    }
                }
            }

        }
    }
}
// sub-item
.line {
    .wrapper {
        margin: 0;

        .item {
            background-color: #202b2f;

            .body .meta .icon {
                max-width: 100px;
            }
        }
    }
}
</style>
