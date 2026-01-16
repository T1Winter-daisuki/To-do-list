### Cấu hình
1. Copy file `.env.example` thành `.env`:
   cp .env.example .env
2. Mở file `.env` mới tạo và cập nhật thông tin trên IDE CSDL của bạn.
3. Tải và cài đặt docker
4. Sau đó chạy lệnh docker run -p {your_port_from redis_url.env}:{your_port_from redis_url.env, default: 6379} --name {your_prj_name} -d redis
   VD: docker run -p 6379:6379 --name to-dolist -d redis 
5. Mỗi lần muốn chạy BE từ sau, mở docker và action docker ở trên chỉ bằng 1 nút bấm