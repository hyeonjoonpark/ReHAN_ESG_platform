#!/bin/bash

# 관리자 계정용 MySQL UTF-8 연결 스크립트
echo "관리자 계정으로 MySQL에 UTF-8 문자셋으로 연결합니다..."
sudo docker exec -it petmon_mysql mysql -u root -psrv123! --default-character-set=utf8mb4 petmon
