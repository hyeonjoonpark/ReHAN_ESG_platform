#!/bin/bash

# MySQL에 UTF-8 문자셋으로 연결하는 스크립트
echo "MySQL에 UTF-8 문자셋으로 연결합니다..."
sudo docker exec -it petmon_mysql mysql -u root -psrv123! --default-character-set=utf8mb4 petmon
