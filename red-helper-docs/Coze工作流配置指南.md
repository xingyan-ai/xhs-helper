# 🔧 Coze 工作流配置指南

## 📋 目录

1. [准备工作](#准备工作)
2. [创建飞书表格](#创建飞书表格)
3. [配置 Coze 工作流](#配置-coze-工作流)
4. [获取配置信息](#获取配置信息)
5. [插件配置](#插件配置)
6. [测试验证](#测试验证)

---

## 准备工作

### 需要注册的账号

1. ✅ **飞书账号** - https://feishu.cn
2. ✅ **Coze 账号** - https://www.coze.cn

### 预计耗时

- 首次配置：约 30-60 分钟
- 熟悉后：约 10-15 分钟

---

## 创建飞书表格

### 第一步：登录飞书

1. 访问 https://feishu.cn
2. 登录你的飞书账号
3. 点击左侧「云文档」

### 第二步：创建多维表格

点击「新建」→「多维表格」，创建以下 3 个表格：

---

#### 表格 1：「笔记采集库」

**用途：** 存储单篇笔记的详细信息

**字段配置：**

| 字段名称 | 字段类型 | 说明 |
|---------|---------|------|
| 标题 | 文本 | 笔记标题 |
| 笔记链接 | 超链接 | 笔记详情页链接 |
| 笔记类型 | 单选 | 选项：图文、视频 |
| 作者 | 文本 | 博主名称 |
| 正文 | 多行文本 | 笔记正文内容 |
| 话题标签 | 多选 | 标签列表（需预设选项） |
| 封面 | 超链接 | 封面图片URL |
| 图片附件 | 超链接 | 所有图片URL（逗号分隔） |
| 点赞数 | 数字 | 点赞数量 |
| 收藏数 | 数字 | 收藏数量 |
| 评论数 | 数字 | 评论数量 |
| 发布时间 | 文本 | 笔记发布时间 |
| 采集时间 | 文本 | 数据采集时间 |
| **点赞数趋势** | **多行文本** | **历史点赞数变化记录** ⭐ 新增 |
| **收藏数趋势** | **多行文本** | **历史收藏数变化记录** ⭐ 新增 |
| **评论数趋势** | **多行文本** | **历史评论数变化记录** ⭐ 新增 |

**重要提示：**
- 「话题标签」字段需要预设一些常用标签选项（如：美食、旅行、探店、穿搭等）
- 也可以设置为「允许添加新选项」

**⭐ 趋势字段说明：**

趋势字段用于记录数据的历史变化，格式如下：

```
01/08 10:31, 2770, +1240
09/24 14:07, 1530, +18
09/23 20:39, 1512
```

每一行包含：
- **日期时间**：采集时间（MM/DD HH:mm格式）
- **当前值**：本次采集的数值
- **差值**：相比上次的增减（首次采集无差值）

**工作原理：**
1. 首次采集：记录初始值，格式：`01/08 10:31, 2770`
2. 再次采集：计算差值，拼接到最前面：`01/09 14:20, 3010, +240\n01/08 10:31, 2770`
3. 后续采集：持续在最前面添加新记录，保持历史完整

这样可以清晰看到点赞数、收藏数、评论数随时间的变化趋势。

---

#### 表格 2：「小红书博主笔记概览」

**用途：** 存储博主笔记列表

**字段配置：**

| 字段名称 | 字段类型 | 说明 |
|---------|---------|------|
| 博主 | 文本 | 博主名称 |
| 标题 | 文本 | 笔记标题 |
| 点赞数 | 数字 | 点赞数量 |
| 笔记链接 | 超链接 | 笔记详情页链接 |
| 封面链接 | 超链接 | 封面图片URL |
| 笔记发布时间预估 | 日期 | 笔记发布时间（预估） |
| 采集时间 | 日期时间 | 数据采集时间 |
| **点赞数趋势** | **多行文本** | **历史点赞数变化记录** ⭐ 新增 |

**说明：** 点赞数趋势的格式和逻辑与「笔记采集库」相同，记录每次采集时点赞数的变化。

---

#### 表格 3：「小红书博主库」

**用途：** 存储博主基础信息

**字段配置：**

| 字段名称 | 字段类型 | 说明 |
|---------|---------|------|
| 博主名称 | 文本 | 博主昵称 |
| 头像 | 超链接 | 头像图片URL |
| 小红书号 | 文本 | 小红书唯一ID |
| 简介 | 多行文本 | 博主个人简介 |
| 粉丝数 | 数字 | 粉丝数量 |
| 主页链接 | 超链接 | 博主主页URL |
| 采集时间 | 文本 | 数据采集时间 |
| **粉丝数趋势** | **多行文本** | **历史粉丝数变化记录** ⭐ 新增 |

**说明：** 粉丝数趋势记录博主粉丝增长历史，帮助分析账号成长情况。

---

### 第三步：获取表格链接

创建好每个表格后：

1. 点击表格右上角的「分享」按钮
2. 选择「复制链接」
3. 链接格式类似：`https://xxx.feishu.cn/base/ABC123?table=tblXXX&view=vewYYY`
4. 保存这 3 个链接，稍后会用到

---

### 第四步：获取飞书授权码（baseToken）

1. 打开任意一个多维表格
2. 点击右上角「...」→「高级设置」
3. 找到「API 访问」或「个人访问令牌」
4. 点击「创建令牌」
5. 设置权限：
   - ✅ 读取记录
   - ✅ 新增记录
   - ✅ 编辑记录
6. 复制生成的 Token（格式：`pat_xxx...`）
7. **妥善保存，不要泄露！**

---

## 配置 Coze 工作流

### 第一步：登录 Coze

1. 访问 https://www.coze.cn
2. 登录你的账号
3. 点击左侧「工作流」

---

### 第二步：创建工作流 1 - 单篇笔记同步

#### 2.1 创建工作流

1. 点击「创建工作流」
2. 命名：`红薯助手_单篇笔记同步`
3. 描述：`同步单篇笔记详细信息到飞书「笔记采集库」`

#### 2.2 配置输入节点

点击「开始」节点，添加以下参数：

| 参数名 | 类型 | 说明 |
|-------|------|------|
| orderId | 文本 | 订单号（用于验证） |
| baseToken | 文本 | 飞书授权码 |
| tableUrl | 文本 | 表格链接 |
| body | 文本 | 笔记数据（JSON字符串） |

#### 2.3 添加「代码」节点 - 验证订单号

节点名称：`验证订单号`

**⚠️ 重要说明：订单号管理方案**

由于你的订单号是从小红书店铺生成的，有以下几种管理方式：

---

**方案1：使用飞书多维表格管理订单号（推荐）** ⭐

**优点：**
- ✅ 可视化管理，方便查看和编辑
- ✅ 支持批量导入订单号
- ✅ 可以记录更多信息（用户名、到期时间、使用次数等）
- ✅ 团队协作方便

**步骤：**

1. 在飞书中创建一个新表格：「订单管理」
2. 字段配置：

| 字段名称 | 字段类型 | 说明 |
|---------|---------|------|
| 订单号 | 文本 | 小红书店铺生成的订单号 |
| 用户名 | 文本 | 购买用户的名称 |
| 购买时间 | 日期时间 | 订单生成时间 |
| 到期时间 | 日期 | 订单有效期截止日期 |
| 是否有效 | 单选 | 选项：有效、已过期、已禁用 |
| 剩余次数 | 数字 | 可使用次数（可选） |
| 备注 | 文本 | 其他说明 |

3. 在 Coze 工作流中使用「飞书多维表格 - 查询记录」节点：

**节点配置步骤：**

① 添加「飞书多维表格 - 查询记录」节点
   - 节点名称：`查询订单信息`

② 配置参数：

| 参数名 | 值 | 说明 |
|-------|---|------|
| table_id | `tblngvHEiKtwElWa` | 订单管理表格的 table_id（从表格链接中提取） |
| table_name | （可选） | 表格名称，用于说明 |
| user_id_type | `open_id` | 用户 ID 类型，保持默认即可 |
| page_token | （留空） | 分页标记，首次查询留空 |
| page_size | `20` | 每页数量，默认 20 |
| app_token | `{{开始.baseToken}}` | 使用输入参数中的飞书授权码 |
| filter | 见下方 | 筛选条件（重要！） |
| sort | （可选） | 排序条件 |
| view_id | （可选） | 视图 ID |

③ **配置 filter（筛选条件）** - 最关键的部分：

```json
{
  "conditions": [
    {
      "field_name": "订单号",
      "operator": "is",
      "value": ["{{开始.orderId}}"]
    },
    {
      "field_name": "是否有效",
      "operator": "is",
      "value": ["有效"]
    }
  ],
  "conjunction": "and"
}
```

**说明：**
- `field_name`: 飞书表格中的字段名称（必须完全一致）
- `operator`: 操作符，`is` 表示"等于"
- `value`: 值，必须是数组格式
- `conjunction`: 多个条件的关系，`and` 表示"且"，`or` 表示"或"

④ **可选：配置 sort（排序）**

```json
[
  {
    "field_name": "购买时间",
    "desc": true
  }
]
```

4. 在「条件判断」节点中：
   - 条件：`{{查询订单信息.has_more}} == false AND {{查询订单信息.items.length}} > 0`
   - 或者简化为：`{{查询订单信息.items.length}} > 0`
   - 如果查询到记录，说明订单号有效且状态为"有效"

---

**方案2：使用外部 API 验证（适合已有订单系统）**

如果你的小红书店铺有后台 API 可以查询订单状态：

```javascript
async function main(input) {
  const { orderId } = input;
  
  try {
    // 调用你的订单验证 API
    const response = await fetch('https://你的API地址/verify-order', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 你的API密钥'
      },
      body: JSON.stringify({ orderId })
    });
    
    const result = await response.json();
    
    return {
      orderId_result: result.valid === true,
      message: result.message || (result.valid ? '订单号有效' : '订单号无效')
    };
  } catch (error) {
    console.error('订单验证失败:', error);
    return {
      orderId_result: false,
      message: '订单验证服务异常，请稍后重试'
    };
  }
}
```

---

**方案3：简单硬编码（仅测试用）**

```javascript
async function main(input) {
  const { orderId } = input;
  
  // ⚠️ 仅用于测试，生产环境请使用方案1或方案2
  const validOrders = ['TEST001', 'TEST002', 'TEST003'];
  const isValid = validOrders.includes(orderId);
  
  return {
    orderId_result: isValid,
    message: isValid ? '订单号有效' : '订单号无效或已过期'
  };
}
```

---

**推荐使用方案1（飞书表格管理）**，具体实现见下方详细步骤。

**输入映射：**
- `orderId` → `{{开始.orderId}}`

#### 2.4 添加「条件判断」节点

节点名称：`判断订单是否有效`

条件设置：
- 条件：`{{验证订单号.orderId_result}} == true`
- 如果为 `true`：继续下一步
- 如果为 `false`：跳转到「返回错误」节点

#### 2.5 添加「代码」节点 - 解析表格链接

节点名称：`解析表格链接`

代码内容：

```javascript
async function main(input) {
  const { tableUrl } = input;
  
  // 飞书表格链接格式：https://xxx.feishu.cn/base/ABC123?table=tblXXX&view=vewYYY
  const appTokenMatch = tableUrl.match(/base\/([^?]+)/);
  const tableIdMatch = tableUrl.match(/table=([^&]+)/);
  
  if (!appTokenMatch || !tableIdMatch) {
    throw new Error('表格链接格式错误，请检查链接是否完整');
  }
  
  return {
    app_token: appTokenMatch[1],
    table_id: tableIdMatch[1]
  };
}
```

**输入映射：**
- `tableUrl` → `{{开始.tableUrl}}`

#### 2.6 添加「代码」节点 - 解析并处理笔记数据

节点名称：`处理笔记数据`

代码内容：

```javascript
async function main(input) {
  const { body } = input;
  
  // 解析 JSON 字符串
  let data;
  try {
    data = JSON.parse(body);
  } catch (error) {
    throw new Error('数据格式错误：' + error.message);
  }
  
  // 处理每条记录
  const processedRecords = data.records.map(record => {
    const fields = record.fields;
    
    // 处理话题标签：从逗号分隔的字符串转为数组
    let tags = [];
    if (fields['话题标签']) {
      tags = fields['话题标签']
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
    }
    
    return {
      fields: {
        "标题": fields['标题'] || '',
        "笔记链接": {
          "link": fields['笔记链接'] || '',
          "text": "查看原文"
        },
        "笔记类型": fields['笔记类型'] || '图文',
        "作者": fields['作者'] || '',
        "正文": fields['正文'] || '',
        "话题标签": tags,  // 多选字段传数组
        "封面": {
          "link": fields['封面'] || '',
          "text": "查看封面"
        },
        "图片附件": {
          "link": fields['图片附件'] || '',
          "text": "查看图片"
        },
        "点赞数": parseInt(fields['点赞数']) || 0,
        "收藏数": parseInt(fields['收藏数']) || 0,
        "评论数": parseInt(fields['评论数']) || 0,
        "发布时间": fields['发布时间'] || '',
        "采集时间": fields['采集时间'] || ''
      }
    };
  });
  
  return {
    records: processedRecords
  };
}
```

**输入映射：**
- `body` → `{{开始.body}}`

#### 2.7 添加「飞书多维表格」节点 - 批量新增记录

节点名称：`写入飞书表格`

节点类型：选择「飞书多维表格 - 批量新增记录」

配置：

1. **授权方式**：Personal Access Token
2. **Token**：`{{开始.baseToken}}`
3. **App Token**：`{{解析表格链接.app_token}}`
4. **Table ID**：`{{解析表格链接.table_id}}`
5. **记录列表**：`{{处理笔记数据.records}}`

#### 2.8 添加「结束」节点 - 返回成功结果

节点名称：`返回成功`

输出内容：

```json
{
  "orderId_result": "{{验证订单号.orderId_result}}",
  "add_result": true,
  "added_count": "{{写入飞书表格.record_count}}",
  "message": "同步成功"
}
```

#### 2.9 添加「结束」节点 - 返回错误结果

节点名称：`返回错误`

输出内容：

```json
{
  "orderId_result": false,
  "add_result": false,
  "message": "{{验证订单号.message}}"
}
```

#### 2.10 保存并发布

1. 点击右上角「保存」
2. 点击「测试运行」验证流程
3. 测试通过后，点击「发布」
4. **复制工作流 ID**（格式：`7550495126771449906`）

---

### 第三步：创建工作流 2 - 博主笔记批量同步

重复「第二步」的流程，但有以下不同：

**工作流名称：** `红薯助手_博主笔记同步`

**节点「处理笔记数据」的代码：**

```javascript
async function main(input) {
  const { body } = input;
  
  let data;
  try {
    data = JSON.parse(body);
  } catch (error) {
    throw new Error('数据格式错误：' + error.message);
  }
  
  const processedRecords = data.records.map(record => {
    const fields = record.fields;
    
    return {
      fields: {
        "博主": fields['博主'] || '',
        "标题": fields['标题'] || '',
        "点赞数": parseInt(fields['点赞数']) || 0,
        "笔记链接": {
          "link": fields['笔记链接'] || '',
          "text": "查看原文"
        },
        "封面链接": {
          "link": fields['封面链接'] || '',
          "text": "查看封面"
        },
        "笔记发布时间预估": fields['笔记发布时间预估'] || '',
        "采集时间": fields['采集时间'] || ''
      }
    };
  });
  
  return {
    records: processedRecords
  };
}
```

发布后，**复制工作流 ID**。

---

### 第四步：创建工作流 3 - 博主信息同步

重复流程，但有以下不同：

**工作流名称：** `红薯助手_博主信息同步`

**节点「处理笔记数据」的代码：**

```javascript
async function main(input) {
  const { body } = input;
  
  let data;
  try {
    data = JSON.parse(body);
  } catch (error) {
    throw new Error('数据格式错误：' + error.message);
  }
  
  const processedRecords = data.records.map(record => {
    const fields = record.fields;
    
    return {
      fields: {
        "博主名称": fields['博主名称'] || '',
        "头像": {
          "link": fields['头像'] || '',
          "text": "查看头像"
        },
        "小红书号": fields['小红书号'] || '',
        "简介": fields['简介'] || '',
        "粉丝数": parseInt(fields['粉丝数']) || 0,
        "主页链接": {
          "link": fields['主页链接'] || '',
          "text": "查看主页"
        },
        "采集时间": fields['采集时间'] || ''
      }
    };
  });
  
  return {
    records: processedRecords
  };
}
```

发布后，**复制工作流 ID**。

---

## 获取配置信息

### 第一步：获取 Coze API Token

1. 在 Coze 平台，点击右上角头像
2. 选择「个人设置」或「API 管理」
3. 找到「API Token」
4. 点击「创建 Token」
5. 设置名称：`红薯助手`
6. 复制生成的 Token（格式：`sat_xxx...`）
7. **妥善保存，不要泄露！**

---

### 第二步：整理所有配置信息

现在你应该有以下信息：

| 配置项 | 示例 | 说明 |
|-------|------|------|
| 订单号 | `TEST001` | 用于验证用户权限 |
| 飞书授权码 | `pat_xxx...` | 飞书 Personal Access Token |
| Coze Token | `sat_xxx...` | Coze API Token |
| 「笔记采集库」链接 | `https://xxx.feishu.cn/base/ABC...` | 飞书表格链接 |
| 「小红书博主笔记概览」链接 | `https://xxx.feishu.cn/base/DEF...` | 飞书表格链接 |
| 「小红书博主库」链接 | `https://xxx.feishu.cn/base/GHI...` | 飞书表格链接 |
| 单篇笔记工作流 ID | `7550495126771449906` | Coze 工作流 ID |
| 博主笔记工作流 ID | `7550495904676167716` | Coze 工作流 ID |
| 博主信息工作流 ID | `7550495802553106467` | Coze 工作流 ID |

---

## 插件配置

### 第一步：打开红薯助手

1. 访问小红书网站
2. 点击浏览器右上角的红薯助手图标
3. 侧边栏打开后，点击右上角的「设置」图标 ⚙️

### 第二步：填写配置

按照上面整理的信息，依次填写：

1. **订单号**：输入你的订单号
2. **多维表格授权码**：粘贴飞书的 `pat_xxx...`
3. **Coze API Token**：粘贴 Coze 的 `sat_xxx...`
4. **「笔记采集库」表格链接**：粘贴表格链接
5. **「小红书博主笔记概览」表格链接**：粘贴表格链接
6. **「小红书博主库」表格链接**：粘贴表格链接
7. **单篇笔记工作流 ID**：粘贴工作流 ID
8. **博主笔记工作流 ID**：粘贴工作流 ID
9. **博主信息工作流 ID**：粘贴工作流 ID

### 第三步：保存配置

点击「保存配置」按钮，看到「保存成功」提示即可。

---

## 测试验证

### 测试 1：单篇笔记采集

1. 打开任意小红书笔记详情页
2. 点击红薯助手侧边栏的「单篇笔记」
3. 点击「开始采集」
4. 等待采集完成
5. 点击「同步飞书」
6. 等待 2-5 秒
7. 查看提示：
   - ✅ 「同步成功」→ 去飞书表格查看数据
   - ❌ 「订单号无效」→ 检查订单号配置
   - ❌ 「同步失败」→ 检查其他配置

### 测试 2：博主笔记批量采集

1. 打开任意博主主页
2. 点击红薯助手侧边栏的「博主笔记」
3. 点击「开始采集」
4. 等待自动滚动和采集（约 20-60 秒）
5. 采集完成后，点击「同步飞书」
6. 查看结果

### 测试 3：博主信息采集

1. 打开任意博主主页
2. 点击红薯助手侧边栏的「博主信息」
3. 点击「开始采集」
4. 点击「同步飞书」
5. 查看结果

---

## 常见问题

### Q1: 提示「订单号无效」怎么办？

**原因：** 订单号验证失败

**解决方案：**
1. 检查插件配置中的订单号是否正确
2. 检查 Coze 工作流中「验证订单号」节点的代码
3. 确保订单号在 `validOrders` 数组中

### Q2: 提示「同步失败」怎么办？

**可能原因：**
1. 飞书授权码无效或过期
2. 表格链接错误
3. 工作流 ID 错误
4. Coze Token 无效

**解决方案：**
1. 重新生成飞书授权码
2. 检查表格链接是否完整
3. 检查工作流 ID 是否正确
4. 重新生成 Coze Token

### Q3: 飞书表格中看不到数据？

**检查步骤：**
1. 确认同步提示是「同步成功」
2. 刷新飞书表格页面
3. 检查表格字段名是否与配置一致
4. 查看 Coze 工作流的运行日志

### Q4: 话题标签显示不正常？

**原因：** 飞书多选字段需要预设选项

**解决方案：**
1. 在飞书表格中，点击「话题标签」字段设置
2. 添加常用标签选项（如：美食、旅行、探店等）
3. 勾选「允许添加新选项」
4. 重新同步数据

### Q5: 图片链接打不开？

**原因：** 小红书图片链接可能有防盗链

**解决方案：**
1. 复制图片链接
2. 在新标签页打开
3. 如果还是打不开，说明链接已失效
4. 建议及时保存重要图片

---

## 进阶配置

### 方案1详解：使用飞书表格管理订单号（推荐）⭐

#### 第一步：创建订单管理表格

1. 在飞书中创建新表格：「订单管理」
2. 完整字段配置：

| 字段名称 | 字段类型 | 说明 | 示例 |
|---------|---------|------|------|
| 订单号 | 文本 | 小红书店铺订单号 | `XHS20250104001` |
| 用户名 | 文本 | 购买用户名称 | `张三` |
| 联系方式 | 文本 | 用户联系方式（可选） | `13800138000` |
| 购买时间 | 日期时间 | 订单生成时间 | `2025-01-04 10:30` |
| 到期时间 | 日期 | 有效期截止日期 | `2025-12-31` |
| 是否有效 | 单选 | 订单状态 | 有效/已过期/已禁用 |
| 剩余次数 | 数字 | 可使用次数（可选） | `100` |
| 已使用次数 | 数字 | 已使用次数（可选） | `0` |
| 套餐类型 | 单选 | 购买的套餐（可选） | 基础版/专业版/旗舰版 |
| 备注 | 多行文本 | 其他说明 | - |

**单选字段「是否有效」的选项：**
- ✅ 有效（绿色）
- ⏰ 已过期（灰色）
- 🚫 已禁用（红色）

#### 第二步：导入订单数据

**方式1：手动添加**
- 直接在表格中点击「新增」
- 填写订单信息

**方式2：批量导入**
1. 准备 Excel 文件，包含所有订单信息
2. 在飞书表格中点击「导入」
3. 选择 Excel 文件
4. 映射字段
5. 确认导入

**方式3：从小红书店铺导出**
1. 登录小红书店铺后台
2. 导出订单数据（CSV 或 Excel）
3. 整理数据格式
4. 导入到飞书表格

#### 第三步：在 Coze 工作流中配置验证逻辑

**替换原来的「代码」节点为「飞书多维表格」节点：**

1. 删除原来的「验证订单号」代码节点
2. 添加「飞书多维表格 - 查询记录」节点
3. 节点名称：`查询订单信息`
4. 配置：

**授权配置：**
- 授权方式：Personal Access Token
- Token：`{{开始.baseToken}}`（复用飞书授权码）

**表格配置：**
- 选择表格：「订单管理」
- 筛选条件：
  - `订单号` 等于 `{{开始.orderId}}`
  - `是否有效` 等于 `有效`

**高级配置（可选）：**
- 如果启用了「到期时间」检查：
  - 添加条件：`到期时间` 大于等于 `今天`
- 如果启用了「剩余次数」检查：
  - 添加条件：`剩余次数` 大于 `0`

5. 添加「代码」节点：`处理验证结果`

```javascript
async function main(input) {
  const { items } = input;
  
  // 如果查询到记录，说明订单有效
  const isValid = items && items.length > 0;
  
  let message = '';
  if (isValid) {
    const order = items[0];
    const fields = order.fields;
    
    message = `订单号有效，欢迎使用！`;
    
    // 可以返回更多订单信息
    return {
      orderId_result: true,
      message: message,
      recordId: order.record_id,  // 保存记录ID，用于后续更新
      orderInfo: {
        userName: fields['用户名'] || '',
        套餐类型: fields['套餐类型'] || '',
        到期时间: fields['到期时间'] || '',
        剩余次数: fields['剩余次数'] || 0,
        已使用次数: fields['已使用次数'] || 0
      }
    };
  } else {
    message = '订单号无效、已过期或已禁用';
    return {
      orderId_result: false,
      message: message
    };
  }
}
```

**输入映射：**
- `items` → `{{查询订单信息.items}}`

**⚠️ 重要说明：**
- 飞书多维表格查询节点返回的数据结构是 `items` 数组，不是 `records`
- 每个 item 包含 `record_id` 和 `fields` 对象
- `fields` 对象中包含各个字段的值

6. 在「条件判断」节点中：
   - 条件：`{{处理验证结果.orderId_result}} == true`

#### 第四步：（可选）添加使用次数扣减

如果你想在每次同步后自动扣减剩余次数：

1. 在工作流的「写入飞书表格」节点之后
2. 添加「代码」节点：`计算新的剩余次数`

```javascript
async function main(input) {
  const { orderInfo } = input;
  
  // 获取当前剩余次数
  const currentCount = orderInfo.剩余次数 || 0;
  
  // 扣减1次
  const newCount = Math.max(0, currentCount - 1);
  
  return {
    newCount: newCount,
    shouldUpdate: currentCount > 0  // 只有剩余次数>0时才扣减
  };
}
```

3. 添加「条件判断」节点：
   - 条件：`{{计算新的剩余次数.shouldUpdate}} == true`

4. 添加「飞书多维表格 - 更新记录」节点：
   - 节点名称：`更新订单使用次数`
   - 表格配置：
     - `app_token`: `{{开始.baseToken}}`
     - `table_id`: `tblngvHEiKtwElWa`（订单管理表格的 table_id）
     - `record_id`: `{{处理验证结果.recordId}}`
   - 更新字段（fields）：
     ```json
     {
       "剩余次数": {{计算新的剩余次数.newCount}},
       "已使用次数": {{处理验证结果.orderInfo.已使用次数}} + 1,
       "最后使用时间": "{{当前时间}}"
     }
     ```

**说明：**
- 使用 `处理验证结果.recordId` 获取记录ID
- 剩余次数和已使用次数需要计算后更新
- 可以额外记录最后使用时间

#### 第五步：日常管理

**查看订单使用情况：**
1. 打开「订单管理」表格
2. 按「已使用次数」排序，查看活跃用户
3. 筛选「剩余次数 = 0」，查看需要续费的用户

**处理过期订单：**
1. 创建视图：「即将过期」
2. 筛选条件：`到期时间` 在 `未来7天内`
3. 提前通知用户续费

**禁用订单：**
1. 找到对应订单
2. 将「是否有效」改为「已禁用」
3. 用户将无法继续使用

---

### 方案2详解：对接小红书店铺 API

如果小红书店铺提供了订单查询 API，可以直接对接：

#### 第一步：获取 API 文档

1. 登录小红书店铺后台
2. 查找「开放平台」或「API 文档」
3. 找到「订单查询」接口

#### 第二步：在 Coze 中调用 API

```javascript
async function main(input) {
  const { orderId } = input;
  
  try {
    // 调用小红书店铺 API
    const response = await fetch('https://店铺API地址/order/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shop-Id': '你的店铺ID',
        'X-Api-Key': '你的API密钥'
      },
      body: JSON.stringify({
        order_id: orderId
      })
    });
    
    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }
    
    const result = await response.json();
    
    // 根据 API 返回结果判断
    const isValid = result.status === 'active' && 
                    result.expired_at > Date.now();
    
    return {
      orderId_result: isValid,
      message: isValid ? '订单号有效' : result.message || '订单号无效',
      orderInfo: result.data || {}
    };
    
  } catch (error) {
    console.error('订单验证失败:', error);
    
    // API 异常时的处理
    return {
      orderId_result: false,
      message: `订单验证服务异常: ${error.message}`
    };
  }
}
```

**优点：**
- ✅ 实时验证，数据最新
- ✅ 自动同步订单状态
- ✅ 无需手动维护

**缺点：**
- ❌ 依赖外部 API 稳定性
- ❌ 需要处理 API 异常情况
- ❌ 可能有调用频率限制

---

### 订单管理最佳实践

#### 1. 安全性

- ✅ 定期更换 API 密钥
- ✅ 不要在代码中硬编码敏感信息
- ✅ 使用 HTTPS 加密传输
- ✅ 记录订单验证日志，防止滥用

#### 2. 用户体验

- ✅ 提供清晰的错误提示
- ✅ 订单即将过期时提前通知
- ✅ 支持订单续费功能
- ✅ 提供使用次数查询

#### 3. 数据统计

在「订单管理」表格中添加统计视图：

**视图1：活跃用户**
- 筛选：`是否有效 = 有效`
- 排序：按「已使用次数」降序

**视图2：即将过期**
- 筛选：`到期时间` 在 `未来7天内`
- 排序：按「到期时间」升序

**视图3：需要续费**
- 筛选：`剩余次数 < 10` 或 `到期时间` 在 `未来30天内`

#### 4. 自动化通知（高级）

可以结合飞书机器人，实现自动通知：

1. 创建飞书机器人
2. 在 Coze 工作流中添加「飞书消息」节点
3. 当订单即将过期或次数不足时，自动发送通知

---

### 三种方案对比

| 特性 | 方案1（飞书表格） | 方案2（外部API） | 方案3（硬编码） |
|-----|-----------------|----------------|---------------|
| 易用性 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 灵活性 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐ |
| 实时性 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 维护成本 | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐ |
| 适用场景 | 中小规模 | 大规模 | 仅测试 |

**推荐：**
- 🥇 个人或小团队：方案1（飞书表格）
- 🥈 有技术团队：方案2（外部API）
- 🥉 仅测试：方案3（硬编码）

---

---

## 🔥 新功能：趋势历史记录

### 功能说明

从 V1.2 版本开始，红薯助手支持自动记录数据变化历史，包括：

**单篇笔记（笔记采集库）：**
- 点赞数趋势
- 收藏数趋势
- 评论数趋势

**博主笔记（小红书博主笔记概览）：**
- 点赞数趋势

**博主信息（小红书博主库）：**
- 粉丝数趋势

### 实现逻辑

当同一笔记/博主被多次采集时，工作流会：

1. **查询历史记录**：根据笔记链接或博主小红书号查找现有记录
2. **读取当前趋势**：获取已保存的趋势字段内容
3. **计算差值**：新值 - 旧值 = 增减量
4. **拼接新记录**：格式化后添加到趋势字段最前面
5. **更新记录**：保存新的数值和趋势历史

### Coze 工作流增强配置

#### 工作流结构调整

原工作流：
```
开始 → 验证订单 → 解析链接 → 处理数据 → 写入表格 → 结束
```

新工作流（增加趋势计算）：
```
开始
  ↓
验证订单（查询订单管理表）
  ↓
解析链接（提取 app_token 和 table_id）
  ↓
处理数据（解析 body）
  ↓
【新增】查询现有记录（根据笔记链接/博主ID）
  ↓
【新增】条件判断：记录是否已存在？
  ├─ 是 → 计算趋势 → 更新记录
  └─ 否 → 新增记录
  ↓
结束
```

#### 详细配置步骤

以「单篇笔记工作流」为例：

---

**步骤1：查询现有记录**

在「处理笔记数据」节点之后，添加「飞书多维表格 - 查询记录」节点：

- 节点名称：`查询现有笔记`
- 配置：
  - `app_token`：`{{解析表格链接.app_token}}`
  - `table_id`：`{{解析表格链接.table_id}}`
  - `page_size`：`1`
  - `filter`：
    ```json
    {
      "conditions": [
        {
          "field_name": "笔记链接",
          "operator": "is",
          "value": ["{{处理笔记数据.records[0].fields.笔记链接.link}}"]
        }
      ],
      "conjunction": "and"
    }
    ```

---

**步骤2：判断记录是否存在**

添加「条件判断」节点：

- 节点名称：`判断是否为首次采集`
- 条件：`{{查询现有笔记.items.length}} > 0`
- 如果为 `true`：跳转到「计算趋势」
- 如果为 `false`：跳转到「新增记录」

---

**步骤3：计算趋势（更新分支）**

添加「代码」节点：

- 节点名称：`计算趋势`
- 代码：

```javascript
async function main(input) {
  const { newData, existingRecord } = input;
  
  // 获取现有数据
  const existingFields = existingRecord.fields;
  const oldLikes = existingFields['点赞数'] || 0;
  const oldCollects = existingFields['收藏数'] || 0;
  const oldComments = existingFields['评论数'] || 0;
  
  // 获取新数据
  const newLikes = newData.fields['点赞数'] || 0;
  const newCollects = newData.fields['收藏数'] || 0;
  const newComments = newData.fields['评论数'] || 0;
  
  // 获取当前趋势历史
  const likesTrend = existingFields['点赞数趋势'] || '';
  const collectsTrend = existingFields['收藏数趋势'] || '';
  const commentsTrend = existingFields['评论数趋势'] || '';
  
  // 生成时间戳（MM/DD HH:mm格式）
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  const timestamp = `${month}/${day} ${hour}:${minute}`;
  
  // 计算差值
  const likesDiff = newLikes - oldLikes;
  const collectsDiff = newCollects - oldCollects;
  const commentsDiff = newComments - oldComments;
  
  // 格式化差值（带 + 或 - 符号）
  const formatDiff = (diff) => {
    if (diff > 0) return `+${diff}`;
    if (diff < 0) return `${diff}`;
    return '+0';
  };
  
  // 拼接新记录（格式：时间, 当前值, 差值）
  const newLikesEntry = `${timestamp}, ${newLikes}, ${formatDiff(likesDiff)}`;
  const newCollectsEntry = `${timestamp}, ${newCollects}, ${formatDiff(collectsDiff)}`;
  const newCommentsEntry = `${timestamp}, ${newComments}, ${formatDiff(commentsDiff)}`;
  
  // 合并趋势（新记录在最前面，用换行符分隔）
  const updatedLikesTrend = likesTrend ? `${newLikesEntry}\n${likesTrend}` : newLikesEntry;
  const updatedCollectsTrend = collectsTrend ? `${newCollectsEntry}\n${collectsTrend}` : newCollectsEntry;
  const updatedCommentsTrend = commentsTrend ? `${newCommentsEntry}\n${commentsTrend}` : newCommentsEntry;
  
  return {
    recordId: existingRecord.record_id,
    updatedFields: {
      "点赞数": newLikes,
      "收藏数": newCollects,
      "评论数": newComments,
      "点赞数趋势": updatedLikesTrend,
      "收藏数趋势": updatedCollectsTrend,
      "评论数趋势": updatedCommentsTrend,
      "采集时间": newData.fields['采集时间']
    }
  };
}
```

- 输入映射：
  - `newData` → `{{处理笔记数据.records[0]}}`
  - `existingRecord` → `{{查询现有笔记.items[0]}}`

---

**步骤4：更新记录**

添加「飞书多维表格 - 更新记录」节点：

- 节点名称：`更新笔记记录`
- 配置：
  - `app_token`：`{{开始.baseToken}}`
  - `table_id`：`{{解析表格链接.table_id}}`
  - `record_id`：`{{计算趋势.recordId}}`
  - `fields`：`{{计算趋势.updatedFields}}`

---

**步骤5：新增记录（首次采集分支）**

原有的「写入飞书表格」节点保持不变，但需要修改「处理笔记数据」节点的代码，为趋势字段设置初始值：

```javascript
// 在处理笔记数据节点中
return {
  fields: {
    // ... 其他字段 ...
    "点赞数": likes,
    "收藏数": collects,
    "评论数": comments,
    // 首次采集，趋势字段设置初始值（格式：时间, 当前值）
    "点赞数趋势": `${timestamp}, ${likes}`,
    "收藏数趋势": `${timestamp}, ${collects}`,
    "评论数趋势": `${timestamp}, ${comments}`
  }
};
```

---

### 博主笔记工作流配置

与单篇笔记类似，但只需处理「点赞数趋势」一个字段：

**查询条件：**
```json
{
  "conditions": [
    {
      "field_name": "笔记链接",
      "operator": "is",
      "value": ["{{处理笔记数据.records[0].fields.笔记链接.link}}"]
    }
  ]
}
```

**计算趋势代码：**
```javascript
// 只处理点赞数趋势
const oldLikes = existingFields['点赞数'] || 0;
const newLikes = newData.fields['点赞数'] || 0;
const likesDiff = newLikes - oldLikes;

const newEntry = `${timestamp}, ${newLikes}, ${formatDiff(likesDiff)}`;
const updatedTrend = existingTrend ? `${newEntry}\n${existingTrend}` : newEntry;

return {
  recordId: existingRecord.record_id,
  updatedFields: {
    "点赞数": newLikes,
    "点赞数趋势": updatedTrend,
    "采集时间": newData.fields['采集时间']
  }
};
```

---

### 博主信息工作流配置

**查询条件：**
```json
{
  "conditions": [
    {
      "field_name": "小红书号",
      "operator": "is",
      "value": ["{{处理笔记数据.records[0].fields.小红书号}}"]
    }
  ]
}
```

**计算趋势代码：**
```javascript
// 处理粉丝数趋势
const oldFollowers = existingFields['粉丝数'] || 0;
const newFollowers = newData.fields['粉丝数'] || 0;
const followersDiff = newFollowers - oldFollowers;

const newEntry = `${timestamp}, ${newFollowers}, ${formatDiff(followersDiff)}`;
const updatedTrend = existingTrend ? `${newEntry}\n${existingTrend}` : newEntry;

return {
  recordId: existingRecord.record_id,
  updatedFields: {
    "粉丝数": newFollowers,
    "粉丝数趋势": updatedTrend,
    "采集时间": newData.fields['采集时间']
  }
};
```

---

### 测试验证

#### 测试场景1：首次采集

1. 采集一篇笔记，点赞数 2000
2. 查看飞书表格，「点赞数趋势」字段内容：
   ```
   01/13 10:30, 2000
   ```

#### 测试场景2：第二次采集

1. 再次采集同一笔记，点赞数增至 2200
2. 查看飞书表格，「点赞数趋势」字段内容：
   ```
   01/13 14:20, 2200, +200
   01/13 10:30, 2000
   ```

#### 测试场景3：多次采集

1. 第三次采集，点赞数增至 2500
2. 查看飞书表格：
   ```
   01/13 18:45, 2500, +300
   01/13 14:20, 2200, +200
   01/13 10:30, 2000
   ```

---

### 数据分析建议

有了趋势历史数据后，你可以：

1. **查看增长速度**：对比不同时间段的增量
2. **发现爆款笔记**：筛选增长最快的笔记
3. **监控数据异常**：发现突然下降或停滞的数据
4. **评估发布时机**：分析哪些时间段互动数增长最快
5. **对比不同博主**：分析粉丝增长速度

### 常见问题

**Q：趋势数据会占用很大空间吗？**

A：不会。每条记录约 20-30 字节，即使采集 100 次，也只占用 2-3KB，完全不影响表格性能。

**Q：如何清空趋势历史？**

A：直接在飞书表格中删除对应字段的内容即可，下次采集会重新开始记录。

**Q：能否修改时间戳格式？**

A：可以。在「计算趋势」代码节点中修改 `timestamp` 的生成逻辑即可。

**Q：趋势数据能导出吗？**

A：可以。导出飞书表格为 Excel 时，趋势字段会一并导出。

---

## 总结

完成以上配置后，你的红薯助手就可以完整使用飞书同步功能了！

**配置清单：**
- ✅ 创建 3 个飞书表格（含趋势字段）
- ✅ 获取飞书授权码
- ✅ 创建 3 个 Coze 工作流（含趋势计算逻辑）
- ✅ 获取 Coze Token
- ✅ 在插件中填写配置
- ✅ 测试验证（包括趋势功能）

如有问题，欢迎反馈！

---

**文档版本：** V1.2  
**最后更新：** 2026-01-13  
**作者：** 红薯助手团队

