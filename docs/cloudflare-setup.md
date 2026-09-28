# Cloudflare Workers + D1 운영

현재 배포 대상은 Pages가 아닌 기존 **dewford Worker**입니다.

- 사이트: https://dewford.rapda98.workers.dev/
- 관리자 로그인: https://dewford.rapda98.workers.dev/admin-login.html
- D1 이름: `dewford-db`, binding: `DB`
- 데이터베이스 ID: `9cc5189d-cfc9-4efb-aebf-9b94a4519f87`

## 1. 관리자 비밀번호 설정 (Cloudflare 화면에서)

`Workers & Pages → dewford → Settings → Variables and Secrets → Add`에서 다음 항목을 생성합니다.

| 항목 | 값 |
|---|---|
| Type | **Secret** |
| Variable name | `ADMIN_PASSWORD` |
| Value | 직접 정한 **16자 이상 256자 이하**의 비밀번호 |

**Deploy**를 눌러 적용합니다. 비밀번호를 코드, GitHub, 채팅에 적지 않습니다.
기본 로그인 아이디는 `admin`입니다. 아이디를 바꾸려면 같은 화면에서 `ADMIN_USERNAME`을 Text 변수로 설정합니다.
비밀번호를 변경하면 기존 로그인 쿠키의 서명이 유효하지 않게 되어 다시 로그인해야 합니다.

계정 설정은 한 명의 운영 관리자용입니다. 공개 회원가입이나 계정 생성 API는 없습니다.
Cloudflare Secret이 비밀번호를 보관하며, 브라우저 번들 및 D1에는 비밀번호를 저장하지 않습니다.
로컬 Python 서버에서 생성한 관리자 계정과는 별개입니다.

## 2. 변경 파일을 GitHub에 반영

GitHub Desktop에서 이번 변경 파일 전체를 Commit 후 Push origin 합니다.
Cloudflare의 기존 Git 연동이 자동으로 새 배포를 실행합니다.

- Build command: 별도 설정 불필요 (비워둠)
- Deploy command: `npx wrangler deploy` (기존 설정 유지)
- Root directory: 저장소 루트
- Node.js: 22 이상

`package.json`과 lockfile에 배포 도구 버전을 고정했습니다. Cloudflare 빌드가 의존성을 설치합니다.
`wrangler.jsonc`에서 API 진입점과 D1 연결을 명시하므로 재배포 후에도 DB 연결이 유지됩니다.
`keep_vars: true`로 화면에서 설정한 일반 변수도 유지합니다. Secret은 저장소에 포함하지 않습니다.

## 3. 로그인과 데이터 확인

배포 성공 후 관리자 로그인 주소에서 `admin`과 설정한 비밀번호로 로그인합니다.
D1의 테이블과 기존 공개 이벤트 6건은 첫 API 요청 때 자동 생성됩니다. 별도 SQL 입력은 필요 없습니다.
`cloudflare/seed.json`은 초기 데이터 전용이며, 재배포해도 수정한 글을 덮어쓰거나 삭제한 글을 복원하지 않습니다.
이후 모든 게시글·일정·상담 내역은 D1에 저장됩니다.

- 관리자 이벤트 수정 → 공개 목록/상세를 새로고침해서 확인
- 유치부/초등부 일정 등록 → 공개 캘린더의 해당 날짜에서 확인
- 상담 신청 제출 → 관리자 상담 내역에서 확인
- 로그아웃 후 상담 내역과 수정 API에 접근할 수 없는지 확인

상담 제출은 접수만 처리하며 자동 이메일 발송은 하지 않습니다.
이미지는 기존처럼 assets 파일 경로나 HTTPS 주소로 지정합니다. 이미지 업로드는 포함하지 않습니다.
초기 데이터는 저장소의 공개 샘플이며, 로컬 SQLite에 별도로 저장한 게시글·상담 내역이 있다면 자동 이전되지 않습니다.

## 미리보기와 운영 오류 구분

`admin.html`을 로컬 파일로 열거나 `?preview=1`을 명시하면 기존 예시 미리보기를 사용할 수 있습니다.
실제 API의 설정 오류/장애(503/500)가 발생하면 오류를 표시하며, 샘플 화면으로 자동 전환하지 않습니다.
설정 누락 시 `/api/session`은 `DATABASE_NOT_CONFIGURED` 또는 `ADMIN_NOT_CONFIGURED` 코드를 반환합니다.

## 개발자 검증

```sh
npm ci
npm test
npx wrangler deploy --dry-run
```

`npm test`는 로컬 Miniflare의 별도 D1을 사용합니다. 운영 DB에 테스트 데이터를 쓰지 않습니다.
로그인/로그아웃, 8시간 만료, 쿠키 서명, CSRF/외부 Origin 차단, 입력 검증, 게시판 간 이동,
순서 변경, 상담 상태 관리, 로그인 제한, 재시작 시 데이터 유지, Secret 변경 시 세션 무효화를 확인합니다.

로컬 UI를 확인하려면 Git/업로드 제외 대상인 `.dev.vars`에 **테스트용** `ADMIN_PASSWORD`를 설정한 뒤
`npm run dev`를 실행합니다. 원격 DB에 연결하지 않습니다.

## 운영 메모

- `.assetsignore`는 원본 대형 JPG, 로컬 DB, 서버 소스, 테스트 및 개발 도구를 정적 업로드에서 제외합니다.
- `/api/*`와 두 개의 공개 데이터 경로만 Worker를 우선 실행하고, 일반 HTML/사진은 정적 자산으로 제공합니다.
- 로그인과 상담 요청에 IP별 제한을 적용합니다. IP 원문을 DB에 기록하지 않습니다.
- 로그인 쿠키는 HttpOnly/SameSite이며 HTTPS에서는 Secure를 적용합니다. API 응답은 캐시하지 않습니다.
- D1 보관/백업과 개인정보 삭제는 운영자가 관리합니다. 상담 내역은 관리자에서 삭제할 수 있습니다.
- 프리뷰 브랜치를 배포할 경우 별도의 테스트용 D1/Secret을 연결하세요. 이 설정은 production 운영용입니다.

공식 참고:
- https://developers.cloudflare.com/workers/configuration/secrets/
- https://developers.cloudflare.com/workers/static-assets/binding/
- https://developers.cloudflare.com/d1/worker-api/d1-database/


## 게시글 이미지 첨부

관리자 글쓰기·수정 화면에서 대표 이미지와 추가 사진을 파일로 선택합니다. JPG/PNG/WebP, 원본 파일당 최대 20MB, 추가 사진 최대 30장입니다. 선택한 사진은 미리보기에서 제거할 수 있고, 저장하기를 누르기 전에는 서버에 업로드하지 않습니다. 저장 시 브라우저에서 최대 1920px, 1MB 이하로 변환하므로 원본 보관용 기능은 아닙니다.

Cloudflare Worker의 인증 및 CSRF 검사를 통과한 요청만 `/api/media`로 업로드할 수 있습니다. 이미지 바이너리는 기존 D1의 `media` 테이블에 저장되며, 별도 바인딩이나 R2 가입은 필요 없습니다. 테이블은 자동 생성됩니다. SHA-256 키로 같은 이미지의 중복 저장을 방지합니다. 공개 게시글에 사용하는 이미지 URL은 공개적으로 조회할 수 있습니다. 게시글에서 사진을 제거해도 공유 참조가 깨지지 않도록 저장된 바이너리는 유지됩니다. 대량의 사진을 장기간 운영할 경우 별도 객체 저장소로 이전하는 것이 적합합니다.

D1 무료 DB 크기 한도는 [공식 제한 안내](https://developers.cloudflare.com/d1/platform/limits/)를 참고하세요. 관리자 권한 확인은 계속 수행하되 페이지 전환 시 확인 문구는 표시하지 않습니다. 인증 오류가 발생할 경우에만 안내를 표시합니다.

## Popup editor and rich content

Public write/edit/move controls open the shared admin form in a same-origin modal iframe. Only messages from that iframe and the same origin can close or refresh the page. Successful saves refresh the public board.

Quill 2.0.3 is vendored in assets/vendor/quill (BSD license included). Content is stored as a server-validated Delta with text and allowlisted formatting only. Public rendering creates text nodes and fixed semantic elements; it never inserts submitted HTML. The HTML export API affected by the Quill 2.0.3 advisory is not used. Legacy posts retain their original layout until edited; editing preserves their text and attachments and converts the body to rich content.

Validation: 16 automated tests, local browser popup save with bold text persisted in D1 and displayed on the detail page, and Wrangler deployment dry-run.
