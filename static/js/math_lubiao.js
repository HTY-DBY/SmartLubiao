// 根据获得的数据，通过 数学 计算路标的启用和转动
// 此时，已经获得了
// 起点坐标 [R_qidian_weizhi, Q_qidian_weizhi],
// 位置坐标 [R_now_weizhi, Q_now_weizhi]
// 终点坐标 [R_zhongdian_weizhi, Q_zhongdian_weizhi],
// 路标坐标 go_lubiao_all
// 对应的路标 lubiao_ID
// 路径坐标 go_lujin_all
// 由于高德地图 API 调回方法的问题，以上数据是 js 执行一遍后才获得的
// 先编译后执行

// 这里的数学方法可由开发者自行定义
// 在这，我提供了自己的一套数学方法，比较简单，通用性不太强
// 部分 使用了for循环 在路标或路线规划较多时 程序较慢 建议在数据库中分类管理

function IndexOf(arr, item) {
    return arr.indexOf(item);
}

// 1 整合路径数据
// 定义一个二维数组，存放所有路径的坐标，第一 和 倒数第一 是 起点 和 终点坐标
go_lujin_all_with_qidian_zhongdian = [];
function data_zhenghe_all_in_go_lujin() {
    for (var i = 1; i < go_lujin_all.length + 1; i++) {
        go_lujin_all_with_qidian_zhongdian[i] = go_lujin_all[i - 1];
    }
    go_lujin_all_with_qidian_zhongdian[0] = [R_qidian_weizhi, Q_qidian_weizhi];
    go_lujin_all_with_qidian_zhongdian[go_lujin_all.length + 1] = [R_zhongdian_weizhi, Q_zhongdian_weizhi];
    // console.log(go_lujin_all_with_qidian_zhongdian)
}

// 2 计算周围的可用路标
// 这里，我们只调用转角处路标，以简化数学计算
// 判断 在 go_lujin_all_with_qidian_zhongdian 的周围是否有可用路标
// 经纬 直线距离 大于 x 时（即勾股定理），认为该路标不可用
lubiao_is_keyong_on = [];// 可用的路标编号
lubiao_is_keyong_on_change = [];// 可用的路标编号，已变化为正常数据
lubiao_is_not_keyong_on = [];// 不可用的路标编号
function panduan_keyonlubiao_is_yes() {
    lubiao_is_keyong_on = [];
    lubiao_is_not_keyong_on = [];
    lubiao_is_keyong_on_change = [];
    var jinwei_juli = 0.5;
    // 这个距离是经过反复测试的
    var the_result_of_panduan_keyonlubiao_is_yes;
    // 不建议这么做，笛卡尔积太大
    for (var j = 0; j < go_lubiao_all.length; j++) {
        for (var i = 0; i < go_lujin_all_with_qidian_zhongdian.length; i++) {
            the_result_of_panduan_keyonlubiao_is_yes =
                Math.sqrt(
                    // 经纬度太小了，这里乘个倍数
                    Math.pow(go_lubiao_all[j][0] * 10000 - go_lujin_all_with_qidian_zhongdian[i][0] * 10000, 2) +
                    Math.pow(go_lubiao_all[j][1] * 10000 - go_lujin_all_with_qidian_zhongdian[i][1] * 10000, 2)
                );
            // console.log(the_result_of_panduan_keyonlubiao_is_yes)
            if (the_result_of_panduan_keyonlubiao_is_yes < jinwei_juli) {
                lubiao_is_keyong_on.push(j);
                // console.log(the_result_of_panduan_keyonlubiao_is_yes)
                break;
            }
        }
    }
    if (lubiao_is_keyong_on.length == 0) {
        $("#lubiao_status")[0].innerHTML = '当前路径无可用路标'
        console.log('当前路径无可用路标')
    } else {
        var the_result_of_change_ID_keyong = []
        var lubiao_is_keyong_on_item = [];
        // 将这个ID数组的顺序调整正确
        // console.log("变化前")
        // console.log(lubiao_is_keyong_on)
        for (var j = 0; j < lubiao_is_keyong_on.length; j++) {
            for (var i = 0; i < go_lujin_all_with_qidian_zhongdian.length; i++) {
                the_result_of_change_ID_keyong =
                    Math.sqrt(
                        // 经纬度太小了，这里乘个倍数
                        Math.pow(go_lubiao_all[lubiao_is_keyong_on[j]][0] * 10000 - go_lujin_all_with_qidian_zhongdian[i][0] * 10000, 2) +
                        Math.pow(go_lubiao_all[lubiao_is_keyong_on[j]][1] * 10000 - go_lujin_all_with_qidian_zhongdian[i][1] * 10000, 2)
                    );
                if (the_result_of_change_ID_keyong < jinwei_juli) {
                    lubiao_is_keyong_on_item.push(lubiao_is_keyong_on[j]);
                    break;
                }
            }
        }
        lubiao_is_keyong_on = lubiao_is_keyong_on_item;
        // console.log("变化后")
        // console.log(lubiao_is_keyong_on)
        $("#lubiao_status")[0].innerHTML = '当前路径有可用路标'
        // console.log('可用路标ID，在数组中')
        // console.log(lubiao_is_keyong_on)
        console.log('可用路标ID(change)')
        for (var i = 0; i < lubiao_is_keyong_on.length; i++) {
            lubiao_is_keyong_on_change[i] = lubiao_ID[lubiao_is_keyong_on[i]];
        };
        console.log(lubiao_is_keyong_on_change)
        for (var j = 0; j < go_lubiao_all.length; j++) {
            if (lubiao_is_keyong_on.indexOf(j) == -1) {
                lubiao_is_not_keyong_on.push(j);
            }
        };
        // console.log('不用路标ID')
        // console.log(lubiao_is_not_keyong_on)
    }

}

// 3 将 不可用的路标 在地图中隐藏
function make_not_keyong_remove() {
    OverlayGroup_all.hide()
}

// 4 为 可用路标 添加标记
OverlayGroup_keyong = new AMap.OverlayGroup()
OverlayGroup_keyong.setMap(map)
function make_keyong_add() {
    OverlayGroup_keyong.hide()
    OverlayGroup_keyong.clearOverlays()
    for (var j = 0; j < lubiao_is_keyong_on.length; j++) {
        lubiao_biaozhu_make = new AMap.Marker({
            position: new AMap.LngLat(
                go_lubiao_all[lubiao_is_keyong_on[j]][0],
                go_lubiao_all[lubiao_is_keyong_on[j]][1]
            ),
            icon: icon_lubiao,
        });
        OverlayGroup_keyong.addOverlay(lubiao_biaozhu_make)
    }
    OverlayGroup_keyong.show()
}

// 5 弹窗提示 是否使用路标导航
//rgb颜色随机
function rgb() {
    var r = Math.floor(Math.random() * 256);
    var g = Math.floor(Math.random() * 256);
    var b = Math.floor(Math.random() * 256);
    var rgb = 'rgb(' + r + ',' + g + ',' + b + ')';
    return rgb;
}
/* 该弹窗代码主体取用于
https://blog.csdn.net/ahilll/article/details/81506005 */
function make_confirm_to_lubiao() {
    var rgb_rand = rgb()
    document.getElementById("lubiao_status").style.color = 'rgb(250, 10, 42)';
    new $Msg({
        content: "满足条件,是否启用智能路标导航",
        type: "success",
        cancle: function () {//  取消后的回调
            new $Msg({
                content: "如需调用,可再次点击图标",
                foot_num: 1, //是否显示底部的确认按钮，数字量
                btnName: ["确定"], //按钮文字内容
            })
            lubiao_is_keyong_on = [];
            lubiao_is_not_keyong_on = [];
        },
        confirm: function () {// 确定后的回调
            make_not_keyong_remove();
            make_keyong_add();
            you_are_using_yes = 1
            new $Msg({
                content: "调用成功",
                foot_num: 1, //是否显示底部的确认按钮，数字量
                btnName: ["确定"], //按钮文字内容
            });
            make_lubiao_use()
            document.getElementById("lubiao_status").style.color = rgb_rand;
            $("#lubiao_status")[0].innerHTML = '您的路标颜色'
            setInterval(() => { make_lubiao_use(); }, 2500);
        }
    })
}

// 6 计算与 我的位置 直线距离最近的路标 为 正在使用的路标的
// 这里还是用了 for 循环，依然不推荐
// 可以尝试冒泡排序，但是懒得写了
function make_lubiao_use_FIND_MIN() {
    var lubiao_use_distance = []
    for (var i = 0; i < lubiao_is_keyong_on.length; i++) {
        lubiao_use_distance[i] = Math.sqrt(
            // 经纬度太小了，这里乘个倍数
            Math.pow(R_now_weizhi * 10000 - go_lubiao_all[lubiao_is_keyong_on[i]][0] * 10000, 2) +
            Math.pow(Q_now_weizhi * 10000 - go_lubiao_all[lubiao_is_keyong_on[i]][1] * 10000, 2)
        )
        // console.log(lubiao_use_distance[i])
    }
    var min = lubiao_use_distance[0];
    var minindex = 0;
    for (var i = 0; i < lubiao_use_distance.length; i++) {
        if (lubiao_use_distance[i] < min) {
            min = lubiao_use_distance[i];
            minindex = i;
        }
    }
    // console.log(lubiao_is_keyong_on[minindex]);
    // 因此应该再次对ID进行扫描以对应
    // 由于这里整合的路标ID顺序上是错乱的
    // 应该通过 整合的路径数组 去查找

    // 返回值是 在 前端整合数组后的位置
    return lubiao_is_keyong_on[minindex]
}

// 7 切换 正在使用的路标的 图标 且 
// 这里我只定义了一种的路标样式，请根据实际情况修改代码
lubiao_use_new_yes = 0
lubiao_use_id_min = ""
function make_lubiao_use() {
    // console.log("实时监控")
    lubiao_use_id_min = make_lubiao_use_FIND_MIN();

    // console.log(lubiao_ID[lubiao_use_id_min])
    if (lubiao_use_new_yes == 1) {
        map.remove(lubiao_use_new_icon)
    }
    lubiao_use_new_icon = new AMap.Marker({
        position: new AMap.LngLat(
            go_lubiao_all[lubiao_use_id_min][0],
            go_lubiao_all[lubiao_use_id_min][1]
        ),
        offset: new AMap.Pixel(-9, -30),
        icon: new AMap.Icon({
            size: new AMap.Size(25, 34),
            // 图标的取图地址
            // 这是我的个人服务器的图片
            image: '../static/image/dir-marker.png',
            // 图标所用图片大小
            imageSize: new AMap.Size(135, 40),
            // 图标取图偏移量
            imageOffset: new AMap.Pixel(-53, -3)
        })
    });

    lubiao_use_new_yes = 1
    map.add(lubiao_use_new_icon)
    lets_over_in_here();
}

// 8 向服务器发送数据 正在使用的路标 和它的转角
// lujin_next_num = 0
function lets_over_in_here() {
    var lubiao_ID_using_here = lubiao_ID[lubiao_use_id_min]
    var now_lujin_distance_old = 100000
    for (var i = 0; i < go_lujin_all_with_qidian_zhongdian.length; i++) {
        now_lujin_distance = Math.sqrt(
            // 经纬度太小了，这里乘个倍数
            Math.pow(go_lujin_all_with_qidian_zhongdian[i][0] * 10000 - go_lubiao_all[lubiao_use_id_min][0] * 10000, 2) +
            Math.pow(go_lujin_all_with_qidian_zhongdian[i][1] * 10000 - go_lubiao_all[lubiao_use_id_min][1] * 10000, 2)
        )
        if (now_lujin_distance < now_lujin_distance_old) {
            now_lujin_distance_old = now_lujin_distance
            now_lujin_distance_min_index = i
        }
    }
    // console.log(now_lujin_distance_min_index)
    var arcTAN = Math.atan((
        go_lujin_all_with_qidian_zhongdian[now_lujin_distance_min_index + 1][1] -
        go_lubiao_all[lubiao_use_id_min][1]
    ) / (
            go_lujin_all_with_qidian_zhongdian[now_lujin_distance_min_index + 1][0] -
            go_lubiao_all[lubiao_use_id_min][0]
        )) * 180 / Math.PI;

    // console.log(lubiao_ID[lubiao_use_id_min])
    // if (lujin_next_num == 1) {
    //     map.remove(lujin_next_new_icon)
    // }
    // lujin_next_new_icon = new AMap.Marker({
    //     position: new AMap.LngLat(
    //         go_lujin_all_with_qidian_zhongdian[now_lujin_distance_min_index + 1][0],
    //         go_lujin_all_with_qidian_zhongdian[now_lujin_distance_min_index + 1][1]
    //     ),
    //     icon: new AMap.Icon({
    //         // 图标的取图地址
    //         image: '../static/image/loc.png',
    //         offset: new AMap.Pixel(-13, -30)
    //     }),
    //     zIndex: 105,// 点标记的叠加顺序，默认zIndex：100
    // });
    // lujin_next_num = 1
    // map.add(lujin_next_new_icon)
    // console.log(
    //     {
    //         "正在使用的路标": {
    //             "ID": lubiao_ID_using_here,
    //             "R": go_lubiao_all[lubiao_use_id_min][0],
    //             "Q": go_lubiao_all[lubiao_use_id_min][1]
    //         },
    //         "下一个路径转角的坐标": {
    //             "R": go_lujin_all_with_qidian_zhongdian[now_lujin_distance_min_index + 1][0],
    //             "Q": go_lujin_all_with_qidian_zhongdian[now_lujin_distance_min_index + 1][1]
    //         },
    //         "角度为": {
    //             "arcTAN":
    //                 arcTAN
    //         }
    //     }
    // )



    $.ajax({
        url: "/API/over", // 数据提交 url
        type: "GET",
        data: {
            "using_ID": lubiao_ID_using_here,
            "using_arcTAN": arcTAN

        },
        /*提交的数据（json格式），从输入框中获取*/
        success: function (result) {
        }
    });
}


// 点击事件
$("#lubiao_zhixiang").click(function () {
    if (go_is_yes_or_data_is_all == 1) {
        // console.log(lubiao_ID)
        if (you_are_using_yes == 0) {
            // 整合数据
            data_zhenghe_all_in_go_lujin();
            // 判断是否可用
            panduan_keyonlubiao_is_yes();
            // 弹窗确认
            if (lubiao_is_keyong_on.length != 0) {
                make_confirm_to_lubiao()
            }
        }
        if (you_are_using_yes == 1) {
            new $Msg({
                content: "您已处于导航中",
                foot_num: 1, //是否显示底部的确认按钮，数字量
                btnName: ["确定"], //按钮文字内容
            });
        }

    }
});