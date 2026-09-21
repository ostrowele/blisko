# Sprawdzenie pierwszej wersji

## Aktualizacja 1.1 — 21 września 2026

W osobnym profilu Chrome z syntetycznymi danymi sprawdzono: wielokrotny wybór leków/objawów/napojów, dawki i nasilenia każdej pozycji, zachowanie wyboru podczas wyszukiwania i dodawania nowej pozycji, anulowanie, edycję pojedynczego wpisu, zachowanie starszych danych, album i kalendarz zdjęć, przechodzenie do kartki, analizę grup i progi liczebności. Sprawdzono układ w szerokościach 320/390/740/900/1200 px, motyw ciemny oraz ładowanie nowych modułów i zapis bez internetu.

Testy analizy obejmują remisy rang, stałe serie, brakujące pomiary, potwierdzony brak zdarzenia, porównanie następnego dnia, objawy, pary przed/po i przekroczenie godziny 04:00. Poprzedni format kopii pozostaje obsługiwany. Testy są w `tests/analysis.test.mjs`.

Sprawdzono 20 września 2026 w oddzielnym, tymczasowym profilu Chrome.

- Dodawanie nastroju, energii, produktywności i napojów.
- Zapis pól dziennika i odtworzenie po ponownym otwarciu.
- Zachowanie wpisu przy zmianie szerokości okna.
- Domyślnie rozwinięte sekcje dziennika.
- Nawyki z wieloma odhaczeniami dziennie.
- Wykres dzienny, zakresy historii i motyw ciemny.
- Wszystkie cztery widoki bez poziomego przepełnienia przy szerokościach 320, 390, 590, 700, 900 i 1200 px.
- Dziennik przy dwukrotnie powiększonym tekście.
- Uruchomienie offline z odtworzeniem zapisanych danych.
- Dodanie i zmniejszenie zdjęcia, eksport kopii ze zdjęciem, przywrócenie i ponowne otwarcie.
- Niezależny zapis kilku dni.
- Odrzucenie nieprawidłowej kopii bez usuwania danych.
- Wykrycie konfliktu podczas edycji w dwóch kartach.
- Granica dnia o 04:00, przejście przez koniec miesiąca/roku, brakujące pomiary, oddzielenie ocen wieczornych od chwilowych i harmonogramy tygodniowe.

Testy podstawowej logiki znajdują się w `tests/core.test.mjs`; można je uruchomić przez `npm test` bez instalacji pakietów.

Nie przeprowadzono jeszcze testu na fizycznym telefonie użytkownika ani instalacji z docelowego adresu GitHub Pages. Publikacja wymaga wskazania repozytorium. Test eksperymentalnego WebMCP wykonano z zastępczym rejestrem w przeglądarce; rzeczywista integracja z przeglądarką udostępniającą ten interfejs nie została zweryfikowana. Aplikacja działa bez WebMCP.
