# Server-side-Project
Install ทั้งหมดนี้
npm install express mysql2 dotenv ejs jsonwebtoken cookie-parser
npm install --save-dev nodemon
npm install node-cron
npm i -D jest babel-jest


Database ใช้ DBeaver
สร้าง Database Connection
เลือก MySql
Database:server_side
Password:12345678
JWT_SECRET=superlongrandomsecretstring
JWT_EXPIRES=24h

วิธีการติดตั้ง
ทำตามขั้นตอนต่อไปนี้เพื่อรันโปรเจกต์บนเครื่องของคุณ

โปรแกรมที่ต้องมี
Node.js (มาพร้อม npm)

Git

Docker Desktop

โปรแกรมจัดการฐานข้อมูล เช่น DBeaver

ขั้นตอนการติดตั้ง
ขั้นตอนที่ 1: โคลนโปรเจกต์
เปิด Terminal แล้วใช้คำสั่ง:

git clone [https://github.com/NangeetoU/Server-side-Project.git](https://github.com/NangeetoU/Server-side-Project.git)

ขั้นตอนที่ 2: เข้าไปในโฟลเดอร์

cd Server-side-Project

ขั้นตอนที่ 3: สร้างไฟล์ .env
สร้างไฟล์ใหม่ชื่อ .env ในโปรเจกต์ แล้วใส่ข้อมูลการเชื่อมต่อฐานข้อมูล:

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=12345678
DB_NAME=server_side
DB_PORT=3306

ขั้นตอนที่ 4: ติดตั้งโปรแกรมเสริม
ใช้คำสั่งนี้เพื่อติดตั้งแพ็คเกจที่จำเป็นทั้งหมด:

npm install

สำหรับติดตั้ง Nodemon (เพื่อให้เซิร์ฟเวอร์รีสตาร์ทเอง):

npm install --save-dev nodemon

ขั้นตอนที่ 5: เปิดฐานข้อมูลด้วย Docker
ตรวจสอบให้แน่ใจว่า Docker Desktop ทำงานอยู่ แล้วใช้คำสั่ง:

docker-compose up -d

คำสั่งนี้จะสร้างฐานข้อมูล MySQL ที่ชื่อ server_side ขึ้นมา

ขั้นตอนที่ 6: สร้างตารางในฐานข้อมูล

เปิดโปรแกรม DBeaver แล้วสร้างการเชื่อมต่อใหม่ (New Connection)

เลือก MySQL

ใส่ข้อมูล:

Server Host: localhost

Database: server_side

Username: root

Password: 12345678

กด Finish เพื่อเชื่อมต่อ

เปิดไฟล์ db_setup/schema.sql ในโปรเจกต์นี้

คัดลอกโค้ด CREATE TABLE ทั้งหมดจากไฟล์นั้น

ใน DBeaver เปิดหน้าต่าง SQL Editor ใหม่ แล้ววางโค้ดลงไป จากนั้นกดรัน (Execute) เพื่อสร้างตาราง users

ขั้นตอนที่ 7: รันโปรแกรม
ใช้คำสั่งนี้เพื่อเปิดเซิร์ฟเวอร์:

node app.js

หรือถ้าใช้ Nodemon:

npm run dev

(หมายเหตุ: ต้องเพิ่มสคริปต์ "dev": "nodemon app.js" ในไฟล์ package.json ก่อน)

ตอนนี้เว็บของคุณจะพร้อมใช้งานที่ http://localhost:3000
