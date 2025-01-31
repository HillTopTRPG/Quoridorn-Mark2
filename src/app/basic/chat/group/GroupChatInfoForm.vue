<template>
  <div class="chat-tab-info-form">
    <simple-tab-component
      :windowKey="windowKey"
      :tabList="tabList"
      v-model="currentTabInfo"
    >
      <!-- 基本タブ -->
      <div class="basic-block" v-if="currentTabInfo.target === 'basic'">
        <table>
          <tr>
            <tr-string-input-component
              label-name="label.name"
              v-model="nameVolatile"
              :placeholder="$t('label.require-text')"
              :colspan="2"
            />
          </tr>
          <tr>
            <tr-store-key-select-component
              label-name="label.authority-group"
              label-property="name"
              type="authority-group-list"
              :nullable="false"
              v-model="authorityGroupKeyVolatile"
              :disabled="!isAdd && isSystem"
            />
            <td>
              <s-button icon="pencil" @click="viewAuthorityGroupList()" />
            </td>
          </tr>
          <tr>
            <tr-checkbox-component
              labelName="label.secret"
              cLabel=""
              nLabel=""
              v-model="isSecretVolatile"
              :colspan="2"
              :readonly="!isAdd && isSystem"
            />
          </tr>
          <tr>
            <tr-store-key-select-component
              label-name="label.chat-tab"
              label-property="name"
              type="chat-tab-list"
              :nullable="true"
              v-model="outputChatTabKeyVolatile"
              :colspan="2"
              :disabled="!isAdd && isSystem"
            />
          </tr>
        </table>
      </div>
      <div
        class="read-aloud-block"
        v-if="currentTabInfo.target === 'read-aloud'"
      >
        <table>
          <tr>
            <tr-number-input-component
              labelName="label.read-aloud-volume"
              inputWidth="5em"
              v-model="readAloudVolumeVolatile"
              :min="0"
              :max="1"
              :step="0.1"
            />
          </tr>
        </table>
      </div>
    </simple-tab-component>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch } from "vue-property-decorator";
import { Mixins } from "vue-mixin-decorator";
import { Task, TaskResult } from "task";
import { TabInfo } from "@/@types/window";
import TaskProcessor from "@/app/core/task/TaskProcessor";
import LifeCycle from "@/app/core/decorator/LifeCycle";
import ComponentVue from "@/app/core/window/ComponentVue";
import TrCheckboxComponent from "@/app/basic/common/components/table-item/TrCheckboxComponent.vue";
import TrStringInputComponent from "@/app/basic/common/components/table-item/TrStringInputComponent.vue";
import TrNumberInputComponent from "@/app/basic/common/components/table-item/TrNumberInputComponent.vue";
import SimpleTabComponent from "@/app/core/component/SimpleTabComponent.vue";
import TrStoreKeySelectComponent from "@/app/basic/common/components/table-item/TrStoreKeySelectComponent.vue";
import SButton from "@/app/basic/common/components/SButton.vue";
import VueEvent from "@/app/core/decorator/VueEvent";
import App from "@/views/App.vue";

@Component({
  components: {
    SButton,
    TrStoreKeySelectComponent,
    TrCheckboxComponent,
    TrNumberInputComponent,
    TrStringInputComponent,
    SimpleTabComponent
  }
})
export default class GroupChatInfoForm extends Mixins<ComponentVue>(
  ComponentVue
) {
  @Prop({ type: String, required: true })
  private windowKey!: string;

  @Prop({ type: String, default: "basic" })
  private initTabTarget!: string;

  @Prop({ type: Boolean, required: true })
  private isAdd!: boolean;

  @Prop({ type: Boolean, required: true })
  private isSystem!: boolean;

  private isMounted: boolean = false;

  @VueEvent
  private viewAuthorityGroupList() {
    App.openSimpleWindow("authority-group-list-window");
  }

  // name
  @Prop({ type: String, required: true })
  private name!: string;
  private nameVolatile: string = "";
  @Watch("name", { immediate: true })
  private onChangeName(value: string) {
    this.nameVolatile = value;
  }
  @Watch("nameVolatile")
  private onChangeNameVolatile(value: string) {
    this.$emit("update:name", value);
  }

  // authorityGroupKey
  @Prop({ type: String, required: true })
  private authorityGroupKey!: string;
  private authorityGroupKeyVolatile: string = "";
  @Watch("authorityGroupKey", { immediate: true })
  private onChangeAuthorityGroupKey(value: string) {
    this.authorityGroupKeyVolatile = value;
  }
  @Watch("authorityGroupKeyVolatile")
  private onChangeAuthorityGroupKeyVolatile(value: string) {
    this.$emit("update:authorityGroupKey", value);
  }

  // isSecret
  @Prop({ type: Boolean, required: true })
  private isSecret!: boolean;
  private isSecretVolatile: boolean = false;
  @Watch("isSecret", { immediate: true })
  private onChangeIsSecret(value: boolean) {
    this.isSecretVolatile = value;
  }
  @Watch("isSecretVolatile")
  private onChangeIsSecretVolatile(value: boolean) {
    this.$emit("update:isSecret", value);
  }

  // outputChatTabKey
  @Prop({ type: String, default: null })
  private outputChatTabKey!: string | null;
  private outputChatTabKeyVolatile: string | null = null;
  @Watch("outputChatTabKey", { immediate: true })
  private onChangeOutputChatTabKey(value: string | null) {
    this.outputChatTabKeyVolatile = value;
  }
  @Watch("outputChatTabKeyVolatile")
  private onChangeOutputChatTabKeyVolatile(value: string | null) {
    this.$emit("update:outputChatTabKey", value);
  }

  private tabList: TabInfo[] = [
    { key: "1", target: "basic", text: "", isDisabled: false }
  ];
  private currentTabInfo: TabInfo = this.tabList[0];

  @TaskProcessor("language-change-finished")
  private async languageChangeFinished(
    task: Task<never, never>
  ): Promise<TaskResult<never> | void> {
    this.createTabInfoList();
    task.resolve();
  }

  @LifeCycle
  private async created() {
    this.createTabInfoList();
  }

  private createTabInfoList() {
    this.tabList.forEach(t => {
      t.text = this.$t(`label.${t.target}`)!.toString();
    });
  }

  @LifeCycle
  public async mounted() {
    this.isMounted = true;
    this.currentTabInfo = this.tabList.find(
      t => t.target === this.initTabTarget
    )!;
  }
}
</script>

<style scoped lang="scss">
@import "../../../../assets/common";

.chat-tab-info-form {
  display: contents;
}

.simple-tab-component {
  width: 100%;
  height: 100%;

  > * {
    border: solid 1px gray;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    padding: 0.2rem;
  }
}
</style>
