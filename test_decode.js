
function unscramble(str) {
    // 1. Check/Strip Prefix
    if (!str.startsWith("1r34LbKcu7") || str.length < 11) {
        return str;
    }
    let s = str.substring(10).split('');

    // 2. Unscramble Blocks
    // Reverse helper: reverses s[i...i+len-1]
    function reverse(arr, i, len) {
        // Decompiled: g(arr, i, i2) -> loop 0 to i2/2. swap(i+i4, i+i2-i4).
        // i2 in decompiled code seemed to be "max index relative to i"?
        // line 59: int i3 = i2 / 2;
        // line 63: int i6 = (i + i2) - i4;
        // So yes, i2 is the inclusive relative end index (length - 1).

        // Call 1: g(c, i2 + 10, 29).  -> Length 30.
        // Call 2: g(c, i2 + 5, 39).   -> Length 40.
        // Call 3: g(c, i2, 49).       -> Length 50.

        let start = i;
        let end = i + len; // Inclusive index of last element?
        // JS logic equivalent to decompiled:
        let loops = Math.floor(len / 2) + (len % 2 === 0 ? 0 : 0); // i2/2 in integer arithmetic
        // wait len=29 (index). size=30.
        // i2=29. i3=14.
        // i4=0..13.
        // Swap 0 and 29. 1 and 28... 13 and 16.
        // 14 and 15 left alone? No.
        // If size 30. Indicies 0..29. Center is 14.5.

        // Let's implement exactly as read:
        // g(arr, offset, max_relative_index)
        let limit = Math.floor(len / 2); // integer division
        for (let k = 0; k < limit; k++) {
            let idx1 = i + k;
            let idx2 = (i + len) - k;
            let tmp = arr[idx1];
            arr[idx1] = arr[idx2];
            arr[idx2] = tmp;
        }
    }

    for (let i = 0; i + 51 < s.length; i += 50) {
        // g(c, i+10, 29) -> range [i+10, i+10+29] inclusive
        reverse(s, i + 10, 29);
        // g(c, i+5, 39)
        reverse(s, i + 5, 39);
        // g(c, i, 49)
        reverse(s, i, 49);
    }

    // 3. Substitution
    let i = 0;
    while (i < s.length - 4) { // Decompiled: i < length - 4
        let chunk = s.slice(i, i + 3).join('');

        if (chunk === "XyQ") {
            s[i] = " "; s[i + 1] = " "; s[i + 2] = " ";
            i += 3;
        } else if (chunk === "Kcl") {
            s[i] = "|"; s[i + 1] = " "; s[i + 2] = "x";
            i += 3;
        } else {
            // Decompiled 'else' block logic
            // if matches "LZ"
            let subChunk = s.slice(i, i + 2).join('');
            if (subChunk === "LZ") {
                s[i] = " "; s[i + 1] = "|";
                i += 1; // i = i3
            }
            i++; // i++

            // Then fall through
            // i = i4 (i+2 relative to start)
            // i++ (i+3 relative to start)

            // Currently i is +2 (if LZ) or +1 (if not LZ).
            // Wait, the decompiled code's control flow is confusing.
            // Let's rely on the ENCODER reverse engineering.

            // Encoder logic implies:
            // "   " -> XyQ (3 chars)
            // "| x" -> Kcl (3 chars)
            // " |"  -> LZ (2 chars)?? But Encoder advances 3!

            // If encoder advances 3, it consumes a 3rd char for " |".
            // What is the 3rd char? It's just passed through?
            // " |A" -> "LZA".

            // The DECODER logic I derived:
            // If XyQ: replace with "   ", advance 3.
            // If Kcl: replace with "| x", advance 3.
            // Else:
            //    If LZ: replace matched 2 chars with " |".
            //    Advance 3?

            // Let's try advancing 3 always for now, but apply replacements if match.
            // But if I advance 3 on LZ, I skip the 3rd char (which remains whatever it was).
            // If valid data, that 3rd char is likely meant to be skipped?

            i += 1; // Compensation for the loop structure?
            // Wait.
            // If I use `continue` in matching blocks, I can control `i`.
            // But I'm simulating "always +3".
            // If I didn't match XyQ or Kcl, I am here.
            // If I matched LZ, I replaced 2 chars.
            // Then I skip 1 char (the 3rd one).
        }
    }
    return s.join('');
}

const testStr1 = "1r34LbKcu7BZL l4E-Xy-EZL lcKQyX-AZ Lx ZL x ZL lcKQXyQKc4TA*{ x ZLA-XyQ lcKQyXEB*[} U> eniF<lcKQyX-E|LZ x |QyX7 la .yQ|ppQyXE|QyX7A|QyXB7ZL lcKQyXEZL7A|<D.CX9AZLFine> x  Z ";
const testStr2 = "1r34LbKcu72TZL b7XyQx ZL lcKQyX7bBLZ x ZL x ZL lcK LZ xB44T[4F7XyQZ ";

console.log("Decoded 1:", unscramble(testStr1));
console.log("Decoded 2:", unscramble(testStr2));
