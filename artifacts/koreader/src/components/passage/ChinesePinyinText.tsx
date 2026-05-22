import { useMemo } from 'react';
import { pinyin } from 'pinyin-pro';
import { cn } from '@/lib/utils';

interface ChinesePinyinTextProps {
  text: string;
  className?: string;
  pinyinClassName?: string;
}

export function ChinesePinyinText({ text, className, pinyinClassName }: ChinesePinyinTextProps) {
  const annotated = useMemo(() => {
    const chars = text.split('');
    return chars.map((char) => {
      const isChinese = /[\u4e00-\u9fff\u3400-\u4dbf]/.test(char);
      if (!isChinese) return { char, py: null };
      const py = pinyin(char, { toneType: 'symbol', type: 'string' });
      return { char, py: py || null };
    });
  }, [text]);

  return (
    <span className={cn('inline', className)}>
      {annotated.map(({ char, py }, i) =>
        py ? (
          <ruby key={i} className="inline-flex flex-col-reverse items-center leading-none mx-px">
            <rb>{char}</rb>
            <rt className={cn('text-[0.55em] text-accent/70 font-normal tracking-tight leading-tight', pinyinClassName)}>
              {py}
            </rt>
          </ruby>
        ) : (
          <span key={i}>{char}</span>
        )
      )}
    </span>
  );
}
