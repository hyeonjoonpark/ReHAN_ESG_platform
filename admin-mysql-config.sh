# 관리자 계정용 MySQL UTF-8 설정
export MYSQL_OPTS="--default-character-set=utf8mb4"
alias mysql="mysql $MYSQL_OPTS"
alias mysql-connect="./mysql-admin-connect.sh"
