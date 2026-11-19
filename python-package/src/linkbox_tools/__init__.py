
def recommend_site(name, url, description=""):
    """웹사이트 추천 정보를 생성합니다."""
    return {
        "name": name,
        "url": url,
        "description": description
    }


def search_sites(sites, keyword):
    """웹사이트 이름과 설명에서 검색어를 찾습니다."""
    keyword = keyword.lower()

    return [
        site for site in sites
        if keyword in site["name"].lower()
        or keyword in site.get("description", "").lower()
    ]
