# 메인 페이지 점검 기록

## 범위
- index.html 및 메인에서만 사용하는 assets 파일.
- 원본 메인 영상과 Elementor 섹션 순서 유지.
- 다른 HTML 파일의 SHA-256 비교 결과 변경 없음.

## 수정 및 확인
- 사진 왜곡 효과 3곳 제거. 이미지 비율 및 표시 크기 보완.
- 성장 영역에 세로 구도의 새 사진 추가.
- 프로그램 제목의 단어 중간 줄바꿈 수정.
- 모바일 성장 단계 카드의 제목과 설명 겹침 해소 확인.
- 사진 위 영문 라벨을 늘어나지 않는 텍스트 배지로 변경.
- 제목 속 원형 사진 크기 40px로 제한.
- 하단 제목 크기와 원형 장식의 음수 여백 보완.
- 데스크톱 프로그램 아코디언 전환 확인.
- 모바일 과정 선택, 메뉴 펼침, 메뉴 선택 후 닫힘 및 섹션 이동 확인.
- 상담 폼 성함·이메일 필수 입력 적용. 빈 폼 제출 시 성함으로 이동 확인.
- 상담 폼은 이메일 작성 창을 여는 방식이며 서버 전송 기능이 아님. 실제 메일 발송은 하지 않음.
- 로컬 리소스 및 내부 앵커 경로 존재 확인.

## 검증 한계
- 후속 점검에서 브라우저 연결을 복구하고 재로드 후 콘솔 검사 완료. 실행 오류 및 경고 0건(일반 JQMIGRATE 안내 로그 제외).
- 1429px 데스크톱과 390px 모바일에서 가로 넘침 없음, 로드 완료 이미지 실패 0건 확인.
- Pretendard 폰트 로드 확인.
- 고정 헤더 메뉴의 과도한 여백을 수정하여 한 줄 배치 확인.
- 하단 제목 그라데이션의 text clipping 보완 후 데스크톱·모바일 표시 확인.
- 텍스트 SVG 로고에 불필요하게 연결된 경로 애니메이션을 제거하여 GSAP 경고 해결.
- 개발자 도구의 처리된 예외 중단 설정은 검증 중 잠시 해제한 뒤 원래대로 복원함.
- 모든 브라우저·기기의 무결함을 보장하는 검증은 아님.

## 생성 이미지
- 파일: assets/images/dewford/individual-reading-portrait.png
- 방식: 내장 image_gen 도구. 생성 결과를 프로젝트에 복사.
- 용도: STUDENT OUTCOMES 세로 사진. 실제 재원생 사진을 의미하지 않는 연출 이미지.
- 프롬프트:

Use case: photorealistic-natural. Create a refined editorial education photograph for the tall student outcomes photo slot of a Korean international learning school homepage. Portrait 5:6 composition. A Korean elementary-age child seated reading an illustrated book at a natural oak table, a kind female teacher beside the child gently listening, candid calm attention and curiosity. Match a warm luminous premium classroom aesthetic: soft late-afternoon golden natural window light, cream linen, muted sage green knitwear, warm oak shelves, leafy plants, blurred books in background, subtle film-like softness yet crisp realistic faces and hands. Medium framing, two subjects within central 70% of image with breathing room for safe cropping at top and bottom; no cropped faces, no extreme closeup, no exaggerated poses. No text, lettering, logos, watermark, charts or UI. Natural proportions and anatomically correct hands. Output a single photograph, not a collage.
