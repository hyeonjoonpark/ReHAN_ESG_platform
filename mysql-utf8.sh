#!/bin/bash

# 관리자 계정용 MySQL UTF-8 연결 (간단 버전)
sudo docker exec -it petmon_mysql mysql -u root -psrv123! --default-character-set=utf8mb4 petmon
