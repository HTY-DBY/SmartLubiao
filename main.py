from flask import Flask, render_template, request, jsonify
from threading import Timer
import binascii  # 16进制编译用
# pipreqs . --encoding=utf-8


class RepeatingTimer(Timer):  # 重写 Thread 的 run 方法 实现定时运行
    def run(self):
        while not self.finished.is_set():
            self.function(*self.args, **self.kwargs)
            self.finished.wait(self.interval)


def hexStr_to_str(hex_str):
    hex = hex_str.encode('utf-8')
    str_bin = binascii.unhexlify(hex)
    return str_bin.decode('utf-8')


app = Flask(__name__)  # 创建 Flask 对象 app 并初始化

# 全局变量
lubiao_ID_all = []
lubiao_N_all = []
lubiao_E_all = []
lubiao_str_all = []
using_ID_arg = []
using_arcTAN_arg = []
# 全局变量 开发者
lubiao_ID_all_kaifazhe = []
lubiao_N_all_kaifazhe = []
lubiao_E_all_kaifazhe = []
lubiao_str_all_kaifazhe = []
# 控制信息
lubiao_control = []


@app.route("/API", methods=["GET", "POST"])  # 定义单片机接口
# 注，如果以16进制等发送需要重编译
def API():  # 获取路标的GPS
    # 以GET访问，访问格式如下
    # {4,3952.56658,11628.70111,gaode_biaozhun}
    # $,ID,$,N,$,E
    # 请以一个标准发送数据 最好为 gps 标准数据，高德坐标 仅用于测试用
    # gps_biaozhun 为 gps 标准数据（美国海洋生物协会)
    # gaode_biaozhun 为 高德坐标
    # 4 表示 路标的ID
    # https://.../API?data=4,3952.56658,11628.70111,gps_biaozhun
    # 如果传来的数据为空
    data = request.args.get("data")
    global lubiao_ID_all, lubiao_N_all, lubiao_E_all, lubiao_str_all, using_arcTAN_arg, using_ID_arg
    print("16进制转化：" + data)
    if data is not None:
        try:
            # 16编译
            data = hexStr_to_str(data)
            print(data)

            data_split = data.split(',')
            # 以 逗号 为标志切割数据
            # 结果 ['4', '3952.56658','11628.70111',GPS_biaozhun]
            lubiao_ID = data_split[0]
            lubiao_N = data_split[1]
            lubiao_E = data_split[2]
            lubiao_str = data_split[3]
            # 如果 ID 不重复
            if (lubiao_ID not in lubiao_ID_all):
                lubiao_ID_all.append(lubiao_ID)
                lubiao_N_all.append(lubiao_N)
                lubiao_E_all.append(lubiao_E)
                lubiao_str_all.append(lubiao_str)
            else:
                ID_here = lubiao_ID_all.index(lubiao_ID)
                lubiao_N_all[ID_here] = lubiao_N
                lubiao_E_all[ID_here] = lubiao_E
                lubiao_str_all[ID_here] = lubiao_str
            if lubiao_ID in using_ID_arg:
                arcTAN_index = lubiao_ID.index(lubiao_ID)
                return '<data>' + '0,'+'0,' + using_arcTAN_arg[arcTAN_index] + '</data>'
            else:
                return '<data>' + 'OK add' + '</data>'
        except:
            return '<data>' + '98513212' + '</data>'
    if data is None:
        return '<data>' + 'the data is none' + '</data>'


@app.route("/API/over", methods=["GET", "POST"])  # 定义前端传输信息的接口
def API_over():
    # https://.../API/over?using_ID=1&using_arcTAN=23
    using_arcTAN = request.args.get("using_arcTAN")
    using_ID = request.args.get("using_ID")
    if using_arcTAN is not None and using_ID is not None:
        global using_ID_arg, using_arcTAN_arg, lubiao_ID_all, lubiao_ID_all_kaifazhe
        if using_ID not in using_ID_arg:
            try:
                lubiao_ID_all_kaifazhe.remove(using_ID)
                print("OK in lubiao_ID_all_kaifazhe")
            except:
                print("not OK in lubiao_ID_all_kaifazhe")
            try:
                lubiao_ID_all.remove(using_ID)
                print("OK in lubiao_ID_all")
            except:
                print("not OK in lubiao_ID_all")

            using_ID_arg.append(using_ID)
            using_arcTAN_arg.append(using_arcTAN)
        return {'message': "OK!"}
    else:
        return {'message': "error!"}


@app.route("/API/delata/kaifazhe", methods=["GET", "POST"])  # 定义开发者的 clear 接口
def API_data_clear():
    clear = request.args.get("clear")
    if clear == '1':
        global lubiao_ID_all_kaifazhe, lubiao_N_all_kaifazhe, lubiao_E_all_kaifazhe, lubiao_str_all_kaifazhe
        lubiao_ID_all_kaifazhe = []
        lubiao_N_all_kaifazhe = []
        lubiao_E_all_kaifazhe = []
        lubiao_str_all_kaifazhe = []
        return '<clear>' + 'data is clear -- kaifazhe' + '</clear>'
    if clear == 0:
        return '<clear>' + 'data is not clear -- kaifazhe' + '</clear>'
    # 如果传来的数据为空
    if clear is None:
        return '<clear>' + 'clear is none -- kaifazhe' + '</clear>'


@app.route("/API/in/kaifazhe", methods=["GET", "POST"])  # 定义单片机接口 开发者
def API_in_kaifazhe():  # 获取路标的GPS
    data = request.args.get("data")
    global lubiao_ID_all_kaifazhe, lubiao_N_all_kaifazhe, lubiao_E_all_kaifazhe, lubiao_str_all_kaifazhe
    if data is not None:
        try:
            data_split = data.split(',')
            lubiao_ID = data_split[0]
            lubiao_N = data_split[1]
            lubiao_E = data_split[2]
            lubiao_str = data_split[3]
            # 如果 ID 不重复
            if (lubiao_ID not in lubiao_ID_all_kaifazhe):
                lubiao_ID_all_kaifazhe.append(lubiao_ID)
                lubiao_N_all_kaifazhe.append(lubiao_N)
                lubiao_E_all_kaifazhe.append(lubiao_E)
                lubiao_str_all_kaifazhe.append(lubiao_str)
            else:
                ID_here = lubiao_ID_all_kaifazhe.index(lubiao_ID)
                lubiao_N_all_kaifazhe[ID_here] = lubiao_N
                lubiao_E_all_kaifazhe[ID_here] = lubiao_E
                lubiao_str_all_kaifazhe[ID_here] = lubiao_str
            return {
                'your_data': {'ID': lubiao_ID,
                              'N': lubiao_N,
                              'E': lubiao_E,
                              'str': lubiao_str,
                              },
                'all_data': {
                    'ID': lubiao_ID_all_kaifazhe,
                    'N': lubiao_N_all_kaifazhe,
                    'E': lubiao_E_all_kaifazhe,
                    'str': lubiao_str_all_kaifazhe,
                },
                'then_data': {
                },
            }
        except:
            return '<data>' + 'the data is wrong -- kaifazhe' + '</data>'
    if data is None:
        return '<id>' + 'data is none -- kaifazhe' + '</id>'


@ app.route("/API/on", methods=["GET", "POST"])  # 定义前端接口
def API_on():
    global lubiao_ID_all, lubiao_N_all, lubiao_E_all
    return {'on_data': {'ID_len': len(lubiao_ID_all),
                        'ID': lubiao_ID_all,
                        'N': lubiao_N_all,
                        'E': lubiao_E_all,
                        'str': lubiao_str_all,
                        },
            }


@ app.route("/API/on/kaifazhe", methods=["GET", "POST"])  # 定义前端接口 开发者
def API_on_kaifazhe():
    global lubiao_ID_all_kaifazhe, lubiao_N_all_kaifazhe, lubiao_E_all_kaifazhe
    return {'on_data': {'ID_len': len(lubiao_ID_all_kaifazhe),
                        'ID': lubiao_ID_all_kaifazhe,
                        'N': lubiao_N_all_kaifazhe,
                        'E': lubiao_E_all_kaifazhe,
                        'str': lubiao_str_all_kaifazhe,
                        },
            }


@ app.route("/", methods=["GET", "POST"])
def INDEX():  # 定义INDEX主页
    return render_template('index.html')


def lubiao_ID_all_clear_function():  # 每 60 s 清空 数据
    global lubiao_ID_all, lubiao_N_all, lubiao_E_all, lubiao_str_all, lubiao_ID_all_kaifazhe, lubiao_N_all_kaifazhe
    global lubiao_E_all_kaifazhe, lubiao_str_all_kaifazhe, using_ID_arg, using_arcTAN_arg
    # 全局变量
    lubiao_ID_all = []
    lubiao_N_all = []
    lubiao_E_all = []
    lubiao_str_all = []
    using_ID_arg = []
    using_arcTAN_arg = []
    # 全局变量 开发者
    lubiao_ID_all_kaifazhe = []
    lubiao_N_all_kaifazhe = []
    lubiao_E_all_kaifazhe = []
    lubiao_str_all_kaifazhe = []
    print('lubiao_ID_all_clear')


# 通过这种方式使得实时更新路标信息，只需要发送时间比清空时间快即可
# 每 x s 清空 ID
# lubiao_ID_all_clear = RepeatingTimer(18, lubiao_ID_all_clear_function)
# lubiao_ID_all_clear.start()


# if __name__ == '__main__':
# 指定端口1001、host,0.0.0.0代表不管几个网卡，任何ip都可以访问
app.run(debug=True, port=1001, host='0.0.0.0')
