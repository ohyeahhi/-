# A5 페이지를 A4 가로에 2쪽씩 책자 순서로 배치합니다 (양면 인쇄 후 반으로 접어 스테이플).
import sys
from pypdf import PdfReader, PdfWriter, PageObject, Transformation

src, dst = sys.argv[1], sys.argv[2]
pages = PdfReader(src).pages
n = len(pages)
assert n % 4 == 0, f"{n}쪽: 책자는 4의 배수여야 합니다"
A4W, A4H = 841.89, 595.28
w, h = float(pages[0].mediabox.width), float(pages[0].mediabox.height)
out = PdfWriter()
for i in range(n // 4):
    for left, right in [(n - 2 * i, 1 + 2 * i), (2 + 2 * i, n - 1 - 2 * i)]:
        sheet = PageObject.create_blank_page(width=A4W, height=A4H)
        for slot, num in enumerate([left, right]):
            x = A4W / 2 * slot + (A4W / 2 - w) / 2
            sheet.merge_transformed_page(pages[num - 1], Transformation().translate(x, (A4H - h) / 2))
        out.add_page(sheet)
out.write(dst)
print(dst, len(out.pages), "sheets-sides")
