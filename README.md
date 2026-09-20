# Blisko — mój dziennik

Prywatna aplikacja PWA po polsku. Działa lokalnie na telefonie, także offline po pierwszym otwarciu. Nie wymaga konta ani serwera z bazą danych. Nie wysyła wpisów i zdjęć do GitHuba ani do usług analitycznych.

## Co zawiera

- Dziś: wielokrotne pomiary nastroju, energii i produktywności (1–10), napoje, leki/suplementy, objawy z nasileniem, aktywności/zdarzenia, sen, wypróżnienia i notatki. Edycja oraz usuwanie wpisów.
- Dziennik: ocena dnia, umysł, ciało, serce, potrzeby z podpowiedziami, trzy przyjemne chwile, jedno zdjęcie dnia i notatki. Wszystkie sekcje otwierają się rozwinięte. Zapis automatyczny.
- Nawyki: codziennie, wybrane dni tygodnia lub liczba wykonań w tygodniu. Kilka odhaczeń dziennie, np. rano/wieczorem. Edycja, archiwum z zachowaniem historii i przywracanie jako nowy okres nawyku.
- Historia: kalendarz ze zdjęciami i wykresy 1/7/30/90 dni. Średnie z pomiarów chwilowych są oddzielone od wieczornej oceny dnia i energii. Brak wpisu nie jest zerem.
- Ustawienia: motyw jasny/ciemny/systemowy, edytowalne kategorie, pełna kopia JSON ze zdjęciami, przywrócenie kopii i eksport CSV.
- Dzień od 04:00 do 03:59. Układ dopasowuje się do szerokości ekranu, także podczas wypełniania.

## Instalacja na telefonie

1. Otwórz opublikowany adres HTTPS w Chrome na Androidzie.
2. W menu ⋮ wybierz **Dodaj do ekranu głównego → Zainstaluj**. Jeśli Chrome pokazuje przycisk instalacji w aplikacji, możesz użyć go zamiast menu.
3. Uruchom aplikację raz z internetem. Kolejne otwarcia działają offline.

Pliku `index.html` nie należy uruchamiać bezpośrednio z pamięci telefonu. PWA potrzebuje adresu HTTPS (lub localhost podczas testów).

## Dane i kopie

Dane przechowywane są w IndexedDB, w tej przeglądarce i dla danego adresu witryny. Zmiana hostingu/adresu, usunięcie danych witryny lub zmiana telefonu wymaga przywrócenia kopii. Kopie nie są szyfrowane. Pobrany plik JSON należy zachować poza aplikacją. CSV służy do przeglądania i analizy, nie jest pełną kopią.

Przywrócenie kopii zastępuje cały dziennik dopiero po potwierdzeniu. Nieprawidłowe pliki są odrzucane. Jednoczesna edycja w dwóch kartach jest wykrywana, aby uniknąć cichego nadpisania wpisów. W razie konfliktu pobierz kopię zmian przed odświeżeniem.

Zdjęcia są skalowane do maksymalnie 1600 pikseli na dłuższym boku i zapisywane jako JPEG. Aplikacja nie zachowuje oryginalnych plików.

## Publikacja przez GitHub Pages

Paczka jest gotowa do umieszczenia w repozytorium. Ustawienia i wpisy użytkownika nie są częścią paczki.

1. Dodaj zawartość tego folderu do repozytorium, zachowując katalog `dist` i ukryty katalog `.github`.
2. W repozytorium wybierz **Settings → Pages → Source: GitHub Actions**.
3. Wprowadź zmianę na gałęzi `main` albo uruchom workflow **Publish Blisko** z zakładki **Actions**.
4. Po zakończeniu wdrożenia otwórz adres pokazany w **Settings → Pages**.

Można też opublikować samą zawartość `dist` jako zwykłe pliki statyczne. Ścieżki są względne; aplikacja obsługuje podkatalog repozytorium.

## Dla osoby rozwijającej aplikację

Aplikacja nie wymaga instalacji zależności ani kompilacji. `npm run check` sprawdza składnię. Lokalny podgląd: `python3 -m http.server 4173 --directory dist`.

- `dist/app.js` — interfejs i obsługa działań.
- `dist/core.js` — model danych, agregacje, harmonogramy i walidacja kopii.
- `dist/db.js` — transakcyjny zapis, osobne rekordy dni oraz wykrywanie konfliktu rewizji.
- `dist/sw.js` — pamięć aplikacji offline. Przy zmianie plików podnieś nazwę `CACHE`. Nowa wersja uruchamia się po zamknięciu wszystkich kart poprzedniej wersji.

Nie ma zewnętrznych skryptów, fontów ani bibliotek pobieranych przy uruchomieniu. Powiadomienia i Health Connect są odłożone do następnej wersji. Import starego formatu „Dziennik Zdrowia” nie jest częścią tej wersji; przywracane są kopie aplikacji Blisko.
