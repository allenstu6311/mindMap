const TreeNode = {
  template: `
<div :class="className" > 

    <h3  v-if='node.val' @dblclick='updateNode(node,$event)'  draggable="true" @drop='dropNode' @dragover="dragover" @dragstart="drogStart" @dragleave="dragleave" @dragenter="dragenter">{{ node.val }}</h3>
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
    };
  },
  mounted() {
    this.debouncedDragover = _.debounce(this.dragoverDebounced, 10);
  },
  methods: {
    updateNode(node, e) {
      // this.closeUpdate()
      if (e.target.children[0] && e.target.children[0].tagName == "INPUT")
        return;
      let input = document.createElement("input");
      input.value = node.val;
      input.classList.add("inputNode");

      const debounceKeyUp = this.debounce((e) => {
        // console.log(e.code);
        if (e.code == "Enter") {
          // node.val = input.value.trim() ? input.value : "請輸入";
          this.$emit("update");
        }

        if (e.code == "Delete") {
          let direction = this.className.includes("node-left")
            ? "left"
            : "right";
          this.$emit("update", [node.id, direction]);
        }

        if (e.code == "Enter") {
          this.node.children.push({
            id: generateUniqueId(),
            val: "new",
            children: [],
          });
          this.$emit("update");
        }
      }, 800);

      input.addEventListener("keyup", (e) => {
        debounceKeyUp(e);
      });
      input.addEventListener("blur", (e) => {
        node.val = input.value.trim() ? input.value : "請輸入";
        this.$emit("update");
        // console.log('target',e.target.parentNodW)
        e.target.parentNode.removeChild(e.target);
      });

      e.target.appendChild(input);
      input.focus();
    },
    drogStart(e) {
      e.stopPropagation();
      if (this.node.id) {
        e.target.classList.add("current")
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

      if (
        this.currDropNode.id != this.node.id &&
        e.target.tagName == "H3" &&
        !e.target.className.includes("target_node")
      ) {
        let checkChild = this.node.children.every(
          (item) => item.id != this.currDropNode.id
        );

        if (checkChild && this.currDropNode.id != this.node.id) {
          e.target.classList.add("target_node");
        }
      }
    },
    dragleave(e) {
      e.stopPropagation();
      e.target.classList.remove("target_node");
    },
    dropNode(e) {
      e.stopPropagation();
      let event = this.currDropNode.event;
      //禁止父層放到子層 && 自己不能放自己
      if (event.target.parentNode.contains(e.target) && event.target != e.target) {
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
    debounce(fn, time) {
      let timer;

      return function (e) {
        clearTimeout(timer);
        timer = setTimeout(() => {
          fn(e);
        }, time);
      };
    },
    getCurrDropNode(node) {
      this.$emit("getCurrDropNode", node);
    },
    update(value) {
      this.$emit("update", value);
    },
  },
};
