export function filterTextByString(title: string, excerpt: string, expectedString: string) {
    if (
        title.toLowerCase().includes(expectedString) ||
        excerpt.toLowerCase().includes(expectedString.trim().toLowerCase())
    )
        return true;
    return false;
}
