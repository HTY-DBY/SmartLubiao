//本代码仅对于Arduino单片机开发
#include <SoftwareSerial.h>

//令4号端口rx,5号端口tx，软件串口
//请将4号端口接定位模块tx，需要时可以可以将5号端口接定位模块rx
SoftwareSerial serial_r4_t5(4, 5);

//令6号端口制脱机状态
const int ENAPin = 6; //电机脱机控制，正
//一般在实际应用中可不接
//令7号端口控制方向
const int DIRPin = 7; //方向信号，正
//令8号端口控制脉冲步进
const int PULPin = 8; //脉冲信号，正
//定义该路标的ID
const String ID = "1";

//令9号端口rx,10号端口tx，软件串口
//请将9号端口接 ttl转233 模块tx，将10号端口接ttl转233模块rx
SoftwareSerial serial_r9_t10(9, 10);

// 全局变量
int gps_listen_num = 0;
String data_gps = "";
String temp_ENA = "";
String temp_DIR = "";
String temp_steps = "";
String temp_steps_old = "";
int speed = 8; //通过定义 speed 控制 定位信息的读取速度

//步进电机子函数
//函数：StepperMotor    功能：控制步进电机是否脱机、方向、步数
//参数：ENA---脱机状态， 1为脱机，脱机即自由转动，不收驱动板控制
//      DIR---方向控制
//      steps---步进的步数，若steps为0，则电机上电电磁锁死，不转
//无返回值
void StepperMotor(int ENA, int DIR, int steps)
{
    digitalWrite(ENAPin, ENA);
    digitalWrite(DIRPin, DIR);
    for (int i = 0; i < steps; i++) //脉冲步进
    {
        digitalWrite(PULPin, HIGH);
        delayMicroseconds(50);
        digitalWrite(PULPin, LOW);
        delayMicroseconds(50);
    }
}

//GPS定位信息格式化函数
//函数：GPS_FORMAT    功能：将GPS数据转化为发送给服务器的标准格式
//参数：ID---路标ID
//      GPS_data---接收到的GPS数据
//返回值：标准化后的GPS数据
String GPS_FORMAT(String ID, String GPS_data)
{
    String the_five = "";
    String jinwei_data_N = "";
    String jinwei_data_E = "";
    int the_num = 0;
    for (int i = 1; i < 6; i++)
    {
        the_five = the_five + GPS_data[i];
    }

    // 如果前5个字符为 GNGGA
    if (the_five == "GNGGA")
    {
        //切割经纬数据字符
        for (int i = 18; i < 100; i++)
        {
            jinwei_data_N = jinwei_data_N + GPS_data[i];
            if (GPS_data[i] == ',')
            {
                the_num = i;
                break;
            }
        }
        for (int i = the_num + 3; i < 100; i++)
        {
            jinwei_data_E = jinwei_data_E + GPS_data[i];
            if (GPS_data[i] == ',')
            {
                break;
            }
        }
    }
    gps_listen_num = 0;
    data_gps = "";
    String return_data = ID + "," + jinwei_data_N + jinwei_data_E + "gps_biaozhun";
    return return_data;
}

//接收服务器数据格式化函数
//函数：SERVER_change    功能：将服务器数据转换为控制电机转动的参数
//参数：control_motor---服务器传来数据的标准格式
//返回值：无
void SERVER_change(String control_motor)
{
    int i = 0;
    String String_temp = "";
    for (; i < 100; i++)
    {
        if (control_motor[i] == ',')
        {
            temp_ENA = String_temp;
            break;
        }
        String_temp = String_temp + control_motor[i];
    }
    String_temp = "";
    for (i = i + 1; i < 100; i++)
    {
        if (control_motor[i] == ',')
        {
            temp_DIR = String_temp;
            break;
        }
        String_temp = String_temp + control_motor[i];
    }

    String_temp = "";
    for (i = i + 1; i < 100; i++)
    {
        if (control_motor[i] == '\0')
        {
            temp_steps = String_temp;
            break;
        }
        String_temp = String_temp + control_motor[i];
    }
}

void setup()
{
    serial_r4_t5.begin(9600);  //初始化软件串口
    serial_r9_t10.begin(9600); //初始化软件串口
    Serial.begin(9600);        //初始化Arduino默认串口
    pinMode(ENAPin, OUTPUT);
    pinMode(DIRPin, OUTPUT);
    pinMode(PULPin, OUTPUT);
}

void loop()
{
    // 测试用，将电脑数据发送到到 serial_r9_t10
    // Serial.println("OK");
    if (Serial.available())
    {
        Serial.println("OK_Serial");
        String control_motor = Serial.readString();
        serial_r9_t10.listen();
        delay(200);
        serial_r9_t10.println(control_motor);
    }

    //当 serial_r4_t5 有信号时，将数据格式化，发送到 4G DTU
    serial_r4_t5.listen();
    delay(200);
    if (serial_r4_t5.available())
    {
        gps_listen_num += 1; // 这是为了控制读取速度
        if (gps_listen_num / speed == 1)
        {
            Serial.println("OK_serial_r4_t5");
            while (serial_r4_t5.available())
            {
                char gps_data_char = serial_r4_t5.read();
                data_gps = data_gps + gps_data_char;
            }
            String data_gps_format = GPS_FORMAT(ID, data_gps);
            // 监视 gps 数据
            Serial.println(data_gps_format);
            // 发送到 4G DTU
            serial_r9_t10.listen();
            delay(200);
            serial_r9_t10.println(data_gps_format);
        }
    }

    //当 serial_r9_t10 有信号时，将数据返回路标
    serial_r9_t10.listen();
    delay(200);
    if (serial_r9_t10.available())
    {
        Serial.println("OK_serial_r9_t10");
        String fuwuqi_rx = serial_r9_t10.readString();
        Serial.println(fuwuqi_rx);
        SERVER_change(fuwuqi_rx);
        delay(100);
        // 如果接收到的是相同数据
        if (temp_steps == temp_steps_old)
        {
            Serial.println("OK_serial_r9_t10_is_on");
        }
        else
        {
            temp_steps_old = temp_steps;
            StepperMotor(atoi(temp_ENA.c_str()), atoi(temp_DIR.c_str()), atoi(temp_steps.c_str()));
        }
        // delay(200);
        // StepperMotor(1, 0, 0); //脱机防烧
    }
    // 如果多次没有数据。则复位步进电机
    else
    {
        StepperMotor(atoi(temp_ENA.c_str()), atoi(temp_DIR.c_str()), -atoi(temp_steps.c_str()));
    }

    delay(300);
}
