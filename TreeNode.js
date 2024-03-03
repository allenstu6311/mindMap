const TreeNode = {
  template: `
<div :class="className" > 
    <h3  v-if='node.val' @dblclick='updateNode(node,$event)'  draggable="true" @drop='dropNode' @dragover="dragover" @dragstart="drogStart" @dragleave="dragleave" @dragenter="dragenter">
    <span  draggable="false" v-html="node.val"></span>
    </h3>
    <div v-if="node.children && node.children.length > 0">

        <tree-node v-for="child in node.children" :key="child.val" :node="child" :class-name="className" @update="update" @get-curr-drop-node="getCurrDropNode"
        :curr-drop-node='currDropNode'
        ></tree-node>

    </div>
</div>
`,
  props: {
    node: Object,
    className: String,
    currDropNode: Object,
    // closeUpdate: Boolean
  },
  data() {
    return {
      fixing: false,
      closeInput: false,
      id: 40,
      currNode: {},
      pushed: [],
      droged: false,
      dragIn:false
    };
  },
  mounted() {
    this.debouncedDragover = _.debounce(this.dragoverDebounced, 10);
  },
  methods: {
    updateNode(node, e) {
      if (e.target.children[0] && e.target.children[0].tagName == "TEXTAREA")
        return;
      let input = document.createElement("textarea");
      // 到輸入框把<br>轉成\t
      input.value = node.val.replace(/<br\s*\/?>/g, "\n");
      input.classList.add("inputNode");

      setTimeout(() => {
        input.style.height = "auto";
        input.style.height = input.scrollHeight + e.target.clientHeight + "px";
      }, 0);

      const debounceKeyUp = _.debounce((e) => {
        // console.log(e)
        if (e.code === "Enter" && e.shiftKey) {
          input.value += "\n";
          return;
        }

        if (e.code == "Delete") {
          let direction = this.className.includes("node-left")
            ? "left"
            : "right";
          this.$emit("update", [node.id, direction]);
        }

        if (e.ctrlKey && e.code == "Enter") {
          this.node.children.push({
            id: generateUniqueId(),
            val: "new",
            children: [],
          });
          this.$emit("update");
        }
      }, 800);

      input.addEventListener("keydown", (e) => {
        debounceKeyUp(e);
      });

      input.addEventListener("blur", (e) => {
        input.value = input.value.trim() ? input.value : "請輸入";

        // 到html把\t轉成<br>
        var formattedContent = input.value.replace(/\n/g, "<br>");
        node.val = formattedContent;
        e.target.parentNode.removeChild(e.target);
        this.$emit("update");
      });

      input.addEventListener("input", (e) => {
        const minHeight = 44;
        // node.val = e.target.value
        if (e.target.value.length === 0) {
          // 如果内容为空，则重置高度为最小高度
          e.target.style.height = minHeight + "px";
        } else {
          // 内容不为空，根据内容设置高度
          e.target.style.height = "auto";
          e.target.parentElement.style.height = "auto";
          e.target.parentElement.parentElement.style.height = "auto";

          e.target.style.height = e.target.scrollHeight + "px";
          e.target.parentElement.style.height = e.target.scrollHeight + "px";
          e.target.parentElement.parentElement.style.height =
            e.target.scrollHeight + "px";
        }
      });

      e.target.appendChild(input);
      input.focus();
    },
    drogStart(e) {
      e.stopPropagation();
      if (this.node.id) {
        e.target.classList.add("current");
        this.node.className = this.className;
        this.node.event = e;
        this.$emit("getCurrDropNode", this.node);
      }
    },
    dragover(e) {
      e.preventDefault();
      this.debouncedDragover(e);
    },
    dragoverDebounced(e) {
      e.stopPropagation();
    },
    dragenter(e) {
      e.stopPropagation();
  
      if (this.currDropNode.id != this.node.id) {
        // 判斷是否為當前節點的子層項目
        let checkChild = this.node.children.every(
          (item) => item.id != this.currDropNode.id
        );

        if (checkChild) {
          if (e.target.tagName == "H3") {
            e.target.classList.add("target_node");
          } else if (e.target.tagName == "SPAN") {
            e.target.parentElement.classList.add("target_node");
          }
        }
      }
    },
    dragleave(e) {
      e.stopPropagation();
      if(e.target.className.includes("target_node")){
        e.target.classList.remove("target_node");
      }
      // e.target.classList.remove("target_node");
    },
    dropNode(e) {
      e.stopPropagation();
      let event = this.currDropNode.event;
      //禁止父層放到子層 && 自己不能放自己
      if (
        event.target.parentNode.contains(e.target) &&
        event.target != e.target.parentElement
      ) {
        alert("無效操作");
        e.target.classList.remove("target_node");

        return;
      }
      if (this.currDropNode.id != this.node.id) {
        let obj = _.cloneDeep(this.currDropNode);
        //複製出來的id不需跟原本的一樣
        obj.id = generateUniqueId();

        this.node.children.push(obj);
        e.target.classList.remove("target_node");

        let direction = this.currDropNode.className.includes("node-left")
          ? "left"
          : "right";
        this.$emit("update", [this.currDropNode.id, direction]);
      }
    },
    getCurrDropNode(node) {
      this.$emit("getCurrDropNode", node);
    },
    update(value) {
      this.$emit("update", value);
    },
  },
};
