/**
 * @file        pageController.js
 * @description Controller นี้จะรับผิดชอบเฉพาะหน้าที่ไม่เกี่ยวกับ User เท่านั้น
 * เช่น หน้าแรก (Home), หน้าเกี่ยวกับเรา (About Us)
 */

/**
 * @description    แสดงหน้า Home Page (GET /)
 * @route          GET /
 * @access         Public
 * @purpose        มีหน้าที่ในการเตรียมข้อมูลเบื้องต้น (title, heading, etc.)
 * แล้วสั่งให้ render (แสดงผล) ไฟล์ index.ejs ซึ่งเป็นหน้าแรกของเว็บ
 */
exports.getHomePage = (req, res) => {
    
    // เตรียมข้อมูลที่จะส่งไปให้ View (index.ejs)
    const pageData = {
        title: "DoDash - Get things done!",
        heading: "DoDash",
        description: `Ready to turn your "to-do" list into a "to-done" list? 
                      Stop feeling overwhelmed and start taking control of your day. 
                      Our simple, beautiful, and powerful platform helps you organize your tasks, 
                      crush your goals, and reclaim your peace of mind. Get more done, with less stress.`
    };

    // สั่งให้ render ไฟล์ index.ejs พร้อมส่งข้อมูล pageData ไปด้วย
    res.render('index', pageData);
};

