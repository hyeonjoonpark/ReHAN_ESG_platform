# MySQL UTF-8 연결 가이드

## 문제 상황
관리자 계정(sudo su)에서 MySQL에 접속할 때 한글이 깨지는 현상이 발생합니다.

## 해결 방법

### 1. 스크립트 사용 (권장)

#### 일반 계정용
```bash
./mysql-connect.sh
```

#### 관리자 계정용
```bash
./mysql-admin-connect.sh
```

### 2. 직접 명령어 사용

#### 일반 계정
```bash
sudo docker exec -it petmon_mysql mysql -u root -psrv123! --default-character-set=utf8mb4 petmon
```

#### 관리자 계정
```bash
sudo docker exec -it petmon_mysql mysql -u root -psrv123! --default-character-set=utf8mb4 petmon
```

### 3. 간단 버전 스크립트
```bash
./mysql-utf8.sh
```

## 환경 설정 (선택사항)

관리자 계정에서 자동으로 UTF-8을 사용하려면:

```bash
# 환경 설정 로드
source admin-mysql-config.sh

# 또는 .bashrc에 추가
echo "source /path/to/admin-mysql-config.sh" >> ~/.bashrc
```

## 확인 방법

한글이 올바르게 표시되는지 확인:
```sql
SELECT * FROM TBL_ERROR_REPORT;
```

정상 출력 예시:
```
+----+--------------+-----------------------------------------+---------------------+
| id | phone_number | error_content                           | created_at          |
+----+--------------+-----------------------------------------+---------------------+
|  1 | 01012345678  | 한글 테스트                             | 2025-08-25 02:53:29 |
+----+--------------+-----------------------------------------+---------------------+
```

## 주의사항

- 관리자 계정에서는 반드시 --default-character-set=utf8mb4 옵션을 사용해야 합니다.
- 일반 계정과 관리자 계정의 터미널 환경이 다를 수 있습니다.
- 스크립트를 사용하면 편리하게 UTF-8로 연결할 수 있습니다.
