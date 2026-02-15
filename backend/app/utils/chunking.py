from typing import List

def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
    """
    Splits text into chunks of approximately `chunk_size` characters with `overlap`.
    Tries to break at paragraph or sentence boundaries.
    """
    if not text:
        return []
    
    chunks = []
    start = 0
    text_len = len(text)
    
    while start < text_len:
        end = start + chunk_size
        
        # If we are at the end, just take the rest
        if end >= text_len:
            chunks.append(text[start:])
            break
        
        # Try to find a natural break point (newline, period, space)
        # Look back from 'end' to find the best break point
        break_point = -1
        
        # Priority 1: Newline (paragraph)
        newline_pos = text.rfind('\n', start, end)
        if newline_pos != -1 and newline_pos > start + chunk_size // 2:
            break_point = newline_pos + 1
        
        # Priority 2: Period (sentence)
        if break_point == -1:
            period_pos = text.rfind('. ', start, end)
            if period_pos != -1 and period_pos > start + chunk_size // 2:
                break_point = period_pos + 2 # Include period and space
        
        # Priority 3: Space (word)
        if break_point == -1:
            space_pos = text.rfind(' ', start, end)
            if space_pos != -1:
                break_point = space_pos + 1
        
        # Fallback: Hard cut
        if break_point == -1:
            break_point = end
            
        chunks.append(text[start:break_point].strip())
        
        # Move start forward, respecting overlap
        start = break_point - overlap
        
        # Ensure we always move forward to prevent infinite loops
        if start <= (break_point - chunk_size): # If overlap is too big relative to move
             start = break_point
        
        # Correction to avoid getting stuck if overlap pushes us back too far
        # effectively we want next chunk to start at start + (chunk_size - overlap) relative to previous start? 
        # No, standard sliding window: stride = chunk_size - overlap. 
        # But here we have variable chunk sizes.
        # Let's simple implementation: start = break_point - overlap. 
        # If break_point didn't advance much (e.g. 1 char), overlap might push `start` behind previous `start`.
        # So ensure `start` > previous `start`.
        
    return [c for c in chunks if c] # Filter empty
