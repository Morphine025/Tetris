// 定义常量，每次移动距离
const STEP = 40;

// 分割容器
// 18行 10列
const ROW_COUNT = 18,
    COL_COUNT = 10;

// 创建模型
const MODELS = [
    // L型
    {
        0: {
            row: 2,
            col: 0,
        },
        1: {
            row: 2,
            col: 1,
        },
        2: {
            row: 2,
            col: 2,
        },
        3: {
            row: 1,
            col: 2,
        },
    },
    // 凸型
    {
        0: {
            row: 1,
            col: 1,
        },
        1: {
            row: 0,
            col: 0,
        },
        2: {
            row: 1,
            col: 0,
        },
        3: {
            row: 2,
            col: 0,
        },
    },
    // 田型
    {
        0: {
            row: 1,
            col: 1,
        },
        1: {
            row: 2,
            col: 1,
        },
        2: {
            row: 1,
            col: 2,
        },
        3: {
            row: 2,
            col: 2,
        },
    },
    // 横型
    {
        0: {
            row: 0,
            col: 0,
        },
        1: {
            row: 0,
            col: 1,
        },
        2: {
            row: 0,
            col: 2,
        },
        3: {
            row: 0,
            col: 3,
        },
    },
    // 竖型
    {
        0: {
            row: 0,
            col: 1,
        },
        1: {
            row: 1,
            col: 1,
        },
        2: {
            row: 2,
            col: 1,
        },
        3: {
            row: 3,
            col: 1,
        },
    },
    // 之型
    {
        0: {
            row: 1,
            col: 1,
        },
        1: {
            row: 1,
            col: 2,
        },
        2: {
            row: 2,
            col: 2,
        },
        3: {
            row: 2,
            col: 3,
        },
    },
    // 反之型
    {
        0: {
            row: 2,
            col: 1,
        },
        1: {
            row: 1,
            col: 2,
        },
        2: {
            row: 2,
            col: 2,
        },
        3: {
            row: 1,
            col: 3,
        },
    }
]

// 变量
// 当前使用的模型
let currentModel = {}

// 标记16宫格位置
let currentX = 0,
    currentY = 0;
// 记录所有块元素位置
// K=行_列 : V=块元素
let fixedBlocks = {}

// 定时器
let msetInterval = null;

// 入口方法
function init() {
    createModel();
    onKeyDown();
}

// 根据模型数据创建对应块元素
function createModel() {
    // 判断游戏是否结束
    if (isGameOver()) {
        gameOver();
        return;
    }
    // 确定使用哪个模型
    currentModel = MODELS[_.random(0, MODELS.length - 1)];
    // 重新初始化16宫格位置
    currentX = 0;
    currentY = 0;
    // 生成对应数量的块元素
    for (let key in currentModel) {
        let divEle = document.createElement("div");
        divEle.className = "activity_model";
        document.getElementById("container").appendChild(divEle);
    }
    // 定位块元素的位置
    locationBlocks();
    // 模型自动下落
    autoDown();
}

// 根据模型数据定位块元素的位置
function locationBlocks() {
    // 判断块元素是否越界
    checkBound();
    // 1.拿到所有块元素
    let eles = document.getElementsByClassName("activity_model");
    for (let i = 0; i < eles.length; i++) {
        // 单个块元素
        let activityModelEle = eles[i];
        // 2.找到每个块元素对应的数据(行列)
        let blockModel = currentModel[i];
        // 3.根据每个块元素对应的数据指定块元素位置
        // 每个块元素位置由两个值决定：1.16宫格位置；2.块元素在16宫格的位置
        activityModelEle.style.top = (currentY + blockModel.row) * STEP + "px";
        activityModelEle.style.left = (currentX + blockModel.col) * STEP + "px";
    }


}

// 监听键盘事件
function onKeyDown() {
    document.onkeydown = function (event) {
        // console.log(event.keyCode);
        // event.keyCode
        switch (event.keyCode) {
            case 37:
                console.log("左");
                move(-1, 0);
                break;
            case 38:
                console.log("上");
                // move(0, -1);
                rotate();
                break;
            case 39:
                console.log("右");
                move(1, 0);
                break;
            case 40:
                console.log("下");
                move(0, 1);
                break;
            default:
                break;
        }
    }
}

// 移动模型
function move(x, y) {
    // 控制块元素移动
    // let activityModelEle = document.getElementsByClassName("activity_model")[0];
    // activityModelEle.style.top = parseInt(activityModelEle.style.top || 0) + y * STEP + "px";
    // activityModelEle.style.left = parseInt(activityModelEle.style.left || 0) + x * STEP + "px";

    if (isMeet(currentX + x, currentY + y, currentModel)) {
        // 底部触碰发生在移动16宫格时候，并且此次移动因为y轴变法而引起
        if (y !== 0) {
            // 模型之间底部发生触碰
            fixedBottomModel();
        }
        return;
    }

    // 16宫格移动
    currentX += x;
    currentY += y;
    // 根据16宫格位置重新定位块元素
    locationBlocks();
}

// 旋转模型
function rotate() {
    // 算法
    // 旋转后的行 = 旋转前的列
    // 旋转后的列 = 3-旋转前的行

    // 克隆currentModel
    let cloneCurrentModel = _.cloneDeep(currentModel);

    // 遍历模型数据
    for (let key in cloneCurrentModel) {
        // 块元素的数据
        let blockModel = cloneCurrentModel[key];
        // 实现算法
        let temp = blockModel.row;
        blockModel.row = blockModel.col;
        blockModel.col = 3 - temp;
    }
    // 如果旋转后会发生触碰，那么就不需要进行旋转了
    if (isMeet(currentX, currentY, cloneCurrentModel)) {
        return;
    }
    // 接受了这次旋转
    currentModel = cloneCurrentModel;

    locationBlocks();
}

// 控制模型只能在容器中移动
function checkBound() {
    // 定义模型活动的边界
    let leftBound = 0,
        rightBound = COL_COUNT,
        bottomBound = ROW_COUNT;
    // 当块元素超出边界之后，让16宫格后退一步
    for (let key in currentModel) {
        // 块元素数据
        let blockModel = currentModel[key];
        // 左侧越界
        if ((blockModel.col + currentX) < leftBound) {
            currentX++;
        }
        // 右侧越界
        if ((blockModel.col + currentX) >= rightBound) {
            currentX--;
        }
        // 右底部越界
        if ((blockModel.row + currentY) >= bottomBound) {
            currentY--;
            fixedBottomModel();
        }
    }
}

// 把模型固定在底部
function fixedBottomModel() {
    // 1.改变模型样式
    // 2.让模型不可进行移动
    let activityModelEles = document.getElementsByClassName("activity_model");
    for (let i = activityModelEles.length - 1; i >= 0; i--) {
        // 拿到每个块元素
        let activityModelEle = activityModelEles[i];
        // 改变块元素类名
        activityModelEle.className = "fixed_model";
        // 把块元素放入变量中
        let blockModel = currentModel[i];
        fixedBlocks[(currentY + blockModel.row) + "_" + (currentX + blockModel.col)] = activityModelEle;
    }
    // 判断此行是否清除
    isRemoveLine();
    // 3.创建新的模型
    createModel();
}

// 触碰体积
// xy表示16宫格将要移动到的位置
// model表示当前模型数据将要完成变化
function isMeet(x, y, model) {
    for (let k in model) {
        let blockModel = model[k];
        // 判断该位置是否存在块元素
        if (fixedBlocks[(y + blockModel.row) + "_" + (x + blockModel.col)]) {
            // true表示将要移动到的位置会发生碰撞，否则返回false
            return true;
        }
    }
    return false;
}

// 判断一行是否被铺满
function isRemoveLine() {
    // 在一行中，每一列都存在块元素，此行清除
    // 遍历所有行中的所有列
    // 遍历所有行
    for (let i = 0; i < ROW_COUNT; i++) {
        // 添加标记符,假设当前行已经被铺满
        let flag = true;
        // 遍历当前行中的所有列
        for (let j = 0; j < COL_COUNT; j++) {
            // 如果当前行中有一列没有数据，那么当前行没有被铺满
            if (!fixedBlocks[i + "_" + j]) {
                flag = false;
                break;
            }
        }
        if (flag) {
            // 改行已经被铺满
            // console.log("改行已经被铺满");
            removeLine(i)
        }
    }
}

// 清理被铺满的行
function removeLine(line) {
    // 遍历该行中的所有列
    for (let i = 0; i < COL_COUNT; i++) {
        // 1.删除改行中所有块元素
        document.getElementById("container").removeChild(fixedBlocks[line + "_" + i]);
        // 2.删除改行中所有块元素的数据
        fixedBlocks[line + "_" + i] = null;
    }
    downLine(line);
}

// 让被清理行之上的块元素下落
function downLine(line) {
    // 遍历被清理行之上的所有行
    for (let i = line - 1; i >= 0; i--) {
        // 该行中的所有列
        for (let j = 0; j < COL_COUNT; j++) {
            if (!fixedBlocks[i + "_" + j]) continue;
            // 存在数据
            // 1.被清理行之上的所有块元素所在的行数+1
            fixedBlocks[(i + 1) + "_" + j] = fixedBlocks[i + "_" + j];
            // 2.让块元素在容器中的位置下落
            fixedBlocks[(i + 1) + "_" + j].style.top = (i + 1) * STEP + "px";
            // 3.清理之前的块元素
            fixedBlocks[i + "_" + j] = null;
        }
    }
}

// 模型自动下落
function autoDown() {
    if (msetInterval) {
        clearInterval(msetInterval);
    }
    msetInterval = setInterval(() => {
        move(0, 1)
    }, 1000);
}

// 判断游戏结束
function isGameOver() {
    for (let i = 0; i < COL_COUNT; i++) {
        if (fixedBlocks["0_" + i]) {
            return true
        };
    }
    return false;
}

// 结束游戏
function gameOver() {
    // 1.停止计时器
    if (msetInterval) {
        clearInterval(msetInterval);
    }
    // 2.弹出对话框
    alert("你挂了")
}