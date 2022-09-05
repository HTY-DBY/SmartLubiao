// 开发者测试平台
// 需要者可以将这里整理做成后端的可视化平台
// 由于开发力度太大，就整合到一个页面了

kai_fa_zhe_is_yes_on = 0;
go_lubiao_all_kaifazhe = [];

// 坐标 控制台声明
function zuobiao_shengming() {
    console.log({
        'qidian_weizh': [R_qidian_weizhi, Q_qidian_weizhi],
        'now_weizhi': [R_now_weizhi, Q_now_weizhi],
        'zhongdian_weizhi': [R_zhongdian_weizhi, Q_zhongdian_weizhi],
        'go_lubiao_all': go_lubiao_all,
        'go_lujin_all': go_lujin_all,
        "lubiao_ID": lubiao_ID,
    })

};

// 坐标转换 并标注 先 N 后 E 先 R 后 Q
// gaode_biaozhuni_is_yes = 0;
function weizhi_bianhua_gps_to_gaode_kaifazhe(zuobiao, num, str) {
    var turnNum = function (nums) {
        return nums.map(Number);
    }
    // 将字符串数组 转为 数组
    zuobiao = turnNum(zuobiao);

    var zuobiao_then = [];

    // 如果数据为 GPS 原生 转化为 WGS84
    if (str == 'gps_biaozhun') {
        var zuobiao_gps_yuanshen_ge_shi = [];
        zuobiao_gps_yuanshen_ge_shi[0] = zuobiao[0] % 100;
        zuobiao_gps_yuanshen_ge_shi[1] = zuobiao[1] % 100;
        zuobiao_then[1] = ((parseInt(zuobiao[0] / 100)) + (zuobiao_gps_yuanshen_ge_shi[0] / 60));
        zuobiao_then[0] = ((parseInt(zuobiao[1] / 100)) + (zuobiao_gps_yuanshen_ge_shi[1] / 60));
    };

    // 如果数据为 高德坐标系
    if (str == 'gaode_biaozhun') {
        gaode_biaozhuni_is_yes = 1;
        zuobiao_then = zuobiao;
    }

    // 如果数据为 GPS 原生 进行标注并存储
    if (gaode_biaozhuni_is_yes == 0) {
        AMap.convertFrom(zuobiao_then, 'gps',
            (status, result) => {
                if (result.info === 'ok') {
                    zhuobiao_zhuanhuan_R = result.locations[0].R;
                    zhuobiao_zhuanhuan_Q = result.locations[0].Q;

                    go_lubiao_all_kaifazhe[num] = [zhuobiao_zhuanhuan_R, zhuobiao_zhuanhuan_Q];

                    lubiao_biaozhu = new AMap.Marker({
                        position: new AMap.LngLat(zhuobiao_zhuanhuan_R, zhuobiao_zhuanhuan_Q),
                        icon: icon_lubiao,
                    });
                    OverlayGroup_all.addOverlay(lubiao_biaozhu)

                }
            }
        )
    }

    // 如果数据为 高德坐标系 进行标注并存储
    if (gaode_biaozhuni_is_yes == 1) {
        gaode_biaozhuni_is_yes = 0;
        go_lubiao_all_kaifazhe[num] = zuobiao_then;
        lubiao_biaozhu = new AMap.Marker({
            position: new AMap.LngLat(zuobiao_then[0], zuobiao_then[1]),
            icon: icon_lubiao,
        });
        OverlayGroup_all.addOverlay(lubiao_biaozhu)
    }

    // 不让路标点外露
    // 开发者模式第一次会暴露，为了与前文件一致，这里重复再写一次
    OverlayGroup_all.hide()
};

// 路标标注
ok_biaozhu_yes_kaifazhe = 0;
ok_biaozhu_yes_kaifazhe_one = 1
function lubiao_all_biaozhu_kaifazhe() {
    if (kai_fa_zhe_is_yes_on == 1) {
        $.ajax({
            url: "/API/on/kaifazhe", // 数据提交 url
            type: "GET",
            data: {},
            /*提交的数据（json格式），从输入框中获取*/
            success: function (result) {
                // console.log(result);
                for (var i = 0; i < result.on_data.ID_len; i++) {
                    weizhi_bianhua_gps_to_gaode_kaifazhe(
                        [result.on_data.N[i], result.on_data.E[i]], i, result.on_data.str[i]);
                    // console.log('路标已标注');
                }
                // 只 执行一次
                if (ok_biaozhu_yes_kaifazhe_one == 1) {
                    ok_biaozhu_yes_kaifazhe = 1;
                    ok_biaozhu_yes_kaifazhe_one = 0
                }
                lubiao_ID = result.on_data.ID
            }
        });
        // console.log(ok_biaozhu_yes_kaifazhe)
    }
};

// 自定义的起点 高德坐标系
kai_fa_zhe_qidian_zhuobiao_zhidingyi =
    [116.481686, 39.875344]

// 自定义的位置 高德坐标系
kai_fa_zhe_weizhi_zhuobiao_zhidingyi =
    [116.482298, 39.875199]

// 自定义的路标的坐标
kai_fa_zhe_zhuobiao_zhidingyi = [
    ['10,116.483585,39.877342,gaode_biaozhun'],
    ['20,116.48358,39.877109,gaode_biaozhun'],
    ['30,116.4845,39.877084,gaode_biaozhun'],
    ['4,116.483577,39.876725,gaode_biaozhun'],
    ['5,116.483582,39.876483,gaode_biaozhun'],
    ['6,116.484527,39.876742,gaode_biaozhun'],
    ['7,116.483581,39.876162,gaode_biaozhun'],
    ['8,116.482294,39.876171,gaode_biaozhun'],
    ['9,116.483882,39.875693,gaode_biaozhun'],
    ['10,116.483608,39.877971,gaode_biaozhun'],
    ['11,116.483608,39.877971,gaode_biaozhun'],
    ['12,116.480219,39.874648,gaode_biaozhun'],
    ['13,116.484665,39.874075,gaode_biaozhun'],
    ['134,116.483061,39.87368,gaode_biaozhun'],
    ['15,116.482294,39.873626,gaode_biaozhun'],
    ['16,116.485121,39.873157,gaode_biaozhun'],
    ['17,116.477684,39.873675,gaode_biaozhun'],
    ['18,116.478827,39.873052,gaode_biaozhun'],
    ['19,116.479122,39.87425,gaode_biaozhun'],
    ['200,116.479122,39.87425,gaode_biaozhun'],
    ['21,116.482293,39.875391,gaode_biaozhun'],
    ['22,116.482287,39.874753,gaode_biaozhun'],
    ['23,116.479106,39.875634,gaode_biaozhun'],
    ['24,116.479664,39.875646,gaode_biaozhun'],
    ['25,116.479701,39.876189,gaode_biaozhun'],
    ['26,116.479696,39.87698,gaode_biaozhun'],
    ['27,116.480232,39.875638,gaode_biaozhun'],
    ['28,116.480224,39.875192,gaode_biaozhun'],
    ['29,116.486409,39.874121,gaode_biaozhun'],
    ['30,116.486951,39.875657,gaode_biaozhun'],
    ['31,116.486962,39.875006,gaode_biaozhun'],
    ['32,116.482284,39.872577,gaode_biaozhun'],
    ['33,116.480358,39.873685,gaode_biaozhun'],
    ['34,116.480219,39.874648,gaode_biaozhun'],
    ['35,116.480498,39.871923,gaode_biaozhun'],
    ['36,116.478985,39.873693,gaode_biaozhun'],
    ['37,116.477697,39.873071,gaode_biaozhun'],
    ['38,116.477976,39.876208,gaode_biaozhun'],
    ['394,116.477976,39.877777,gaode_biaozhun'],
    ['40,116.47973,39.878452,gaode_biaozhun'],
    ['471,116.479698,39.87902,gaode_biaozhun'],
    ['42,116.480782,39.878452,gaode_biaozhun'],
    ['43,116.478089,39.879016,gaode_biaozhun'],
    ['44,116.478003,39.878468,gaode_biaozhun'],
    ['45,116.480825,39.878938,gaode_biaozhun'],
    ['46,116.481549,39.877987,gaode_biaozhun'],
    ['47,116.480342,39.876616,gaode_biaozhun'],
    ['48,116.482477,39.878427,gaode_biaozhun'],
    ['459,116.482091,39.877978,gaode_biaozhun'],
    ['50,116.485508,39.876085,gaode_biaozhun'],
    ['51,116.485497,39.874224,gaode_biaozhun'],
    ['542,116.485465,39.872491,gaode_biaozhun'],
    ['53,116.482278,39.872188,gaode_biaozhun'],
    ['54,116.482262,39.871733,gaode_biaozhun'],
    ['55,116.478824,39.87254,gaode_biaozhun'],
    ['56,116.47796,39.87527,gaode_biaozhun'],
    ['57,116.479124,39.876188,gaode_biaozhun'],
    ['58,116.481265,39.875179,gaode_biaozhun'],
    ['59,116.487042,39.874245,gaode_biaozhun'],
    ['6450,116.485513,39.875673,gaode_biaozhun'],
    ['641,116.480294,39.876179,gaode_biaozhun'],
    ['622,116.479714,39.877727,gaode_biaozhun'],
    ['63,116.481246,39.874881,gaode_biaozhun'],
    ['64,116.480219,39.87422,gaode_biaozhun'],
    ['65,116.480489,39.873127,gaode_biaozhun'],
    ['66,116.480479,39.872534,gaode_biaozhun'],
    ['67,116.48127,39.877019,gaode_biaozhun'],
    ['68,116.481533,39.877736,gaode_biaozhun'],
    ['69,116.482024,39.877032,gaode_biaozhun'],
    ['70,116.480455,39.877015,gaode_biaozhun'],
    ['71,116.480455,39.877727,gaode_biaozhun'],
    ['72,116.481206,39.87429,gaode_biaozhun'],
    ['743,116.481753,39.878913,gaode_biaozhun'],
    ['74,116.478851,39.877731,gaode_biaozhun'],
    ['75,116.483582,39.877341,gaode_biaozhun'],
    ['756,116.478888,39.878457,gaode_biaozhun'],
    ['77,116.482461,39.878926,gaode_biaozhun'],
    ['78,116.4823,39.874089,gaode_biaozhun'],
    ['79,116.479639,39.871899,gaode_biaozhun'],
    ['80,116.477982,39.874256,gaode_biaozhun'],
    ['81,116.481238,39.876608,gaode_biaozhun'],
    ['82,116.477982,39.876962,gaode_biaozhun'],
    ['83,116.478832,39.874233,gaode_biaozhun'],
    ['84,116.479068,39.875271,gaode_biaozhun'],
    ['85,116.482296,39.875187,gaode_biaozhun'],
    ['861,116.478841,39.877357,gaode_biaozhun'],
]

// 居中 覆盖物，外露 路标点，替换 路标 数据
function ok_biaozhu_yes_kaifazhe_function() {
    if (ok_biaozhu_yes_kaifazhe == 1) {
        ok_biaozhu_yes_kaifazhe = 0;
        OverlayGroup_all.show()
        map.setFitView();
        $('#kai_fa_zhe')[0].innerHTML = '开发者模式'
        // console.log('自定义路标已标注')
        go_lubiao_all = [];
        go_lubiao_all = go_lubiao_all_kaifazhe
        // 外露 路标点
    }
}

setInterval(() => {
    this.ok_biaozhu_yes_kaifazhe_function();
}, 2000);

// 触发 开发者模式
$("#test_kaifazhe").click(function () {
    if (kai_fa_zhe_is_yes_on == 1) {
        zuobiao_shengming();
    }
    if (kai_fa_zhe_is_yes_on == 0) {
        var kaifazhe_bool = confirm("是否开启开发者模式");
        if (kaifazhe_bool == true) {
            kai_fa_zhe_is_yes_on = 1;
            $('#kai_fa_zhe')[0].innerHTML = '请等待'
            $('#status_div')[0].innerHTML = ''
            $('#tishi_qidian_div')[0].innerHTML = ''
            console.log('您已进入开发者模式 ');
            // 标注 开发者 的路标数据
            lubiao_all_biaozhu_kaifazhe();
            // 标注 开发者 起点
            if (is_first_dingwei_kaifazhe == 1) {
                map.remove(marker_qidian);
            }
            zuobiao_to_qidian(kai_fa_zhe_qidian_zhuobiao_zhidingyi[0], kai_fa_zhe_qidian_zhuobiao_zhidingyi[1])
            R_qidian_weizhi = kai_fa_zhe_qidian_zhuobiao_zhidingyi[0]
            Q_qidian_weizhi = kai_fa_zhe_qidian_zhuobiao_zhidingyi[1]
            geocoder.getAddress(kai_fa_zhe_qidian_zhuobiao_zhidingyi, function (status, result) {
                if (status === 'complete' && result.info === 'OK') {
                    // console.log(result);
                    document.getElementById('qi_dian').innerHTML = result.regeocode.formattedAddress;
                }
            })
            // 开启开发者自选起点
            qidian_kaifazhe_inyour = 1;
            // 开启开发者自选我的位置
            my_kaifazhe_inyour = 1;
            // 标注 开发者 位置
            R_now_weizhi = kai_fa_zhe_weizhi_zhuobiao_zhidingyi[0];
            Q_now_weizhi = kai_fa_zhe_weizhi_zhuobiao_zhidingyi[1];
            if (is_first_dingwei_kaifazhe == 1) {
                map.remove(tubiao_my_here)
            }
            zuobiao_to_my(R_now_weizhi, Q_now_weizhi);
            geocoder.getAddress([R_qidian_weizhi, Q_qidian_weizhi], function (status, result) {
                if (status === 'complete' && result.info === 'OK') {
                    // console.log(result);
                    document.getElementById('my_wei_zhi_dian').innerHTML = result.regeocode.formattedAddress;
                }
            })
            // 如果有，清除终点坐标
            if (zuojian_is_yes_click == 1) {
                map.remove(marker_old);
            }
            // 先清空开发者内存中存储的路标数据
            // $.ajax({
            //     url: "/API/delata/kaifazhe", // 数据提交 url
            //     type: "GET",
            //     data: { "clear": '1' },
            //     /*提交的数据（json格式），从输入框中获取*/
            //     success: function (result) {
            //     }
            // });
            // // 再清空路标集合数据
            // OverlayGroup_all.clearOverlays()
            // 逐一加入路标数据，在 kai_fa_zhe_zhuobiao_zhidingyi 定义
            function add_lubioa_data() {

                for (var i = 0; i < kai_fa_zhe_zhuobiao_zhidingyi.length; i++) {
                    $.ajax({
                        url: "/API/in/kaifazhe", // 数据提交 url
                        type: "GET",
                        data: { "data": kai_fa_zhe_zhuobiao_zhidingyi[i][0] },
                        /*提交的数据（json格式），从输入框中获取*/
                        success: function (result) {
                        }
                    });
                }
            }
            setInterval(() => { add_lubioa_data(); console.log("OK") }, 20000);

        }
    }
});