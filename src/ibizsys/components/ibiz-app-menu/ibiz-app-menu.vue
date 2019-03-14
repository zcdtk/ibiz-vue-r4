<template>
  <div class="ibiz-app-menu">
    <el-menu
      class="ibiz-menu"
      :mode="mode"
      :menu-trigger="trigger"
      @select="onSelect"
      :default-active="ctrl.selectItem.id"
      :collapse="isCollapse"
    >
      <template v-for="(item0, index0) in ctrl.items">
        <!---  一级菜单有子项 begin  --->
        <template v-if="item0.items && item0.items.length > 0">
          <el-submenu
            :key="index0"
            v-show="!item0.hidden"
            :index="item0.id"
            :popper-class="['ibiz-popper-menu', $root.themeClass]"
          >
            <template slot="title">
              <img v-if="item0.icon != ''" :src="item0.icon">
              <i
                v-else
                class="ibiz-menu-icon"
                :class="[item0.iconcls == '' ? 'fa fa-cogs' : item0.iconcls ]"
                aria-hidden="true"
              ></i>
              <span slot="title">{{ item0.text }}</span>
              <Icon class="active-icon" type="md-arrow-dropleft"/>
            </template>
            <template v-for="(item1, index1) in item0.items">
              <!---  二级菜单有子项 begin  --->
              <template v-if="item1.items && item1.items.length > 0">
                <el-submenu :key="index1" v-show="!item1.hidden" :index="item1.id">
                  <template slot="title">
                    <img v-if="item1.icon != ''" :src="item1.icon">
                    <i
                      class="ibiz-menu-icon"
                      v-else-if="item1.iconcls != ''"
                      :class="item1.iconcls"
                      aria-hidden="true"
                    ></i>
                    <span slot="title">{{ item1.text }}</span>
                  </template>

                  <!---  三级菜单 begin  --->
                  <template v-for="(item2, index2) in item1.items">
                    <el-menu-item :key="index2" v-show="!item2.hidden" :index="item2.id">
                      <img v-if="item2.icon != ''" :src="item2.icon">
                      <i
                        class="ibiz-menu-icon"
                        v-else-if="item2.iconcls != ''"
                        :class="item2.iconcls"
                        aria-hidden="true"
                      ></i>
                      <span slot="title">{{ item2.text }}</span>
                    </el-menu-item>
                  </template>
                  <!---  三级菜单有 begin  --->
                </el-submenu>
              </template>
              <!---  二级菜单有子项 end  --->
              <!---  二级菜单无子项 begin  --->
              <template v-else>
                <el-menu-item :key="index1" v-show="!item1.hidden" :index="item1.id">
                  <img v-if="item1.icon != ''" :src="item1.icon">
                  <i
                    class="ibiz-menu-icon"
                    v-else-if="item1.iconcls != ''"
                    :class="item1.iconcls"
                    aria-hidden="true"
                  ></i>
                  <span slot="title">{{ item1.text }}</span>
                </el-menu-item>
              </template>
              <!---  二级菜单无子项 end  --->
            </template>
          </el-submenu>
        </template>
        <!---  一级菜单有子项 end  --->
        <!---  一级菜单无子项 begin  --->
        <template v-else>
          <el-menu-item :key="index0" v-show="!item0.hidden" :index="item0.id">
            <img v-if="item0.icon != ''" :src="item0.icon">
            <i
              v-else
              class="ibiz-menu-icon"
              :class="[item0.iconcls == '' ? 'fa fa-cogs' : item0.iconcls ]"
              aria-hidden="true"
            ></i>
            <span slot="title">{{ item0.text }}</span>
          </el-menu-item>
        </template>
        <!---  一级菜单无子项 end  --->
      </template>
    </el-menu>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component({})
export default class IBizAppMenu extends Vue {
  // 部件
  @Prop() public ctrl: any;
  // 视图控制器
  @Prop() public viewController: any;
  // 是否收缩
  @Prop() public isCollapse: boolean = false;
  // 显示模式
  @Prop() public mode: string = "vertical";

  public trigger: string = "click";

  public created() {
    if (Object.is(this.mode, "horizontal")) {
      this.trigger = "hover";
    }
  }

  public onSelect(name: string) {
    if (this.ctrl && !Object.is(name, "")) {
      let item = this.ctrl.getItem(this.ctrl.getItems(), { id: name });
      this.ctrl.onSelectChange(item);
    }
  }
}
</script>

<style scoped lang="less">
@import "./ibiz-app-menu.less";
</style>

