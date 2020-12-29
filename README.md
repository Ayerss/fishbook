# FishBook

命令行看小说

### 安装
```
npm install -g fishbook
fishbook -h
```

### 导入小说
```
fishbook add /path/filename.txt
```

### 选择小说
```
fishbook bookshelf           // 选择小说
fishbook bookshelf bookname  // 切换到指定小说
```

### 选择章节
```
fishbook chapter         // 默认第一页
fishbook chapter page    // 页数 Number
fishbook chapter end     // 最后一页 String
```

### 阅读
默认为选中的小说，可使用`fishbook bookshelf` 修改
```
fishbook read
```

### 删除小说
```
fishbook bookshelf -d            // 选择要删除的小说
fishbook bookshelf bookname -d   // 删除指定小说
```

### License
[MIT](http://www.opensource.org/licenses/MIT)
