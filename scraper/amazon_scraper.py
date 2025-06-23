#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
from bs4 import BeautifulSoup
import json
import time
import random
from fake_useragent import UserAgent
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import pymongo
from dotenv import load_dotenv
import os
import re

# Charger les variables d'environnement
load_dotenv()

class AmazonBookScraper:
    def __init__(self):
        self.ua = UserAgent()
        self.base_url = "https://www.amazon.fr"
        self.books_data = []
        self.setup_database()
        self.setup_driver()
        
    def setup_database(self):
        """Configuration de la connexion MongoDB"""
        try:
            mongo_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/recommendation_books')
            self.client = pymongo.MongoClient(mongo_uri)
            self.db = self.client.recommendation_books
            self.books_collection = self.db.books
            print("Connexion à MongoDB établie")
        except Exception as e:
            print(f"Erreur de connexion MongoDB: {e}")
            self.client = None
    
    def setup_driver(self):
        """Configuration du driver Selenium"""
        try:
            chrome_options = Options()
            chrome_options.add_argument("--headless")
            chrome_options.add_argument("--no-sandbox")
            chrome_options.add_argument("--disable-dev-shm-usage")
            chrome_options.add_argument(f"--user-agent={self.ua.random}")
            
            service = Service(ChromeDriverManager().install())
            self.driver = webdriver.Chrome(service=service, options=chrome_options)
            print("Driver Selenium configuré")
        except Exception as e:
            print(f"Erreur de configuration Selenium: {e}")
            self.driver = None
    
    def get_headers(self):
        """Générer des headers aléatoires"""
        return {
            'User-Agent': self.ua.random,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'fr,fr-FR;q=0.8,en-US;q=0.5,en;q=0.3',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        }
    
    def search_books_by_genre(self, genre, max_pages=3):
        """Rechercher des livres par genre"""
        search_terms = {
            'roman': ['roman français', 'roman contemporain', 'roman classique'],
            'science-fiction': ['science fiction', 'sf', 'roman science fiction'],
            'fantasy': ['fantasy', 'roman fantasy', 'heroic fantasy'],
            'policier': ['roman policier', 'thriller', 'polar français'],
            'biographie': ['biographie', 'mémoires', 'autobiographie'],
            'histoire': ['histoire', 'livre histoire', 'histoire de france'],
            'développement personnel': ['développement personnel', 'motivation', 'psychologie'],
            'cuisine': ['livre cuisine', 'recettes', 'gastronomie']
        }
        
        terms = search_terms.get(genre, [genre])
        
        for term in terms:
            print(f"Recherche pour: {term}")
            for page in range(1, max_pages + 1):
                try:
                    self.scrape_search_results(term, page, genre)
                    time.sleep(random.uniform(2, 5))
                except Exception as e:
                    print(f"Erreur lors du scraping de la page {page} pour {term}: {e}")
                    continue
    
    def scrape_search_results(self, search_term, page, genre):
        """Scraper les résultats de recherche"""
        if page == 1:
            url = f"{self.base_url}/s?k={search_term.replace(' ', '+')}&i=stripbooks"
        else:
            url = f"{self.base_url}/s?k={search_term.replace(' ', '+')}&i=stripbooks&page={page}"
        
        try:
            if self.driver:
                self.driver.get(url)
                WebDriverWait(self.driver, 10).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, "[data-component-type='s-search-result']"))
                )
                html = self.driver.page_source
            else:
                response = requests.get(url, headers=self.get_headers(), timeout=10)
                html = response.text
            
            soup = BeautifulSoup(html, 'html.parser')
            self.parse_search_results(soup, genre)
            
        except Exception as e:
            print(f"Erreur lors de la récupération de {url}: {e}")
    
    def parse_search_results(self, soup, genre):
        """Parser les résultats de recherche"""
        products = soup.find_all('div', {'data-component-type': 's-search-result'})
        
        for product in products:
            try:
                book_data = self.extract_book_data(product, genre)
                if book_data:
                    self.books_data.append(book_data)
            except Exception as e:
                print(f"Erreur lors de l'extraction des données: {e}")
                continue
    
    def extract_book_data(self, product, genre):
        """Extraire les données d'un livre de manière robuste."""
        try:
            # L'ASIN est l'identifiant unique et fiable pour un produit sur Amazon
            asin = product.get('data-asin', '')
            if not asin:
                return None  # Si pas d'ASIN, on ne peut pas créer de lien fiable, on ignore

            # Titre
            title_elem = product.find('h2')
            title = title_elem.get_text(strip=True) if title_elem else "Titre inconnu"

            # Auteur
            author_elem = product.find('div', class_='a-row a-size-base a-color-secondary')
            author = author_elem.get_text(strip=True) if author_elem else "Auteur inconnu"
            if 'par ' in author.lower():
                 author = author.split('par ')[-1]


            # URL Amazon fiable basée sur l'ASIN
            amazon_url = f"{self.base_url}/dp/{asin}"

            # Image URL
            image_elem = product.find('img', {'class': 's-image'})
            image_url = image_elem.get('src') if image_elem else None

            # Prix
            price = None
            price_elem = product.find('span', class_='a-price-whole')
            if price_elem:
                price_text = price_elem.get_text(strip=True).replace(',', '.')
                try: price = float(price_text)
                except ValueError: price = None

            # Note
            rating = None
            rating_elem = product.find('span', class_='a-icon-alt')
            if rating_elem:
                rating_match = re.search(r'(\d,?\d?)', rating_elem.text)
                if rating_match:
                    try: rating = float(rating_match.group(1).replace(',', '.'))
                    except ValueError: rating = None
            
            description = f"Livre du genre {genre} - {title} par {author}"
            age_recommandee = self.get_age_recommendation(genre)
            statut_familial = self.get_family_status(genre)
            
            book_data = {
                'titre': title,
                'auteur': author,
                'genre': [genre],
                'description': description,
                'prix': price,
                'note': rating,
                'amazonUrl': amazon_url,
                'ageRecommandee': age_recommandee,
                'statutFamilial': statut_familial,
                'imageUrl': image_url
            }
            
            return book_data
            
        except Exception as e:
            print(f"Erreur d'extraction : {e} - pour le produit ASIN {asin}")
            return None
    
    def get_age_recommendation(self, genre):
        """Déterminer l'âge recommandé basé sur le genre"""
        age_mapping = {
            'roman': 25,
            'science-fiction': 20,
            'fantasy': 18,
            'policier': 25,
            'biographie': 30,
            'histoire': 25,
            'développement personnel': 25,
            'cuisine': 20
        }
        return age_mapping.get(genre, 25)
    
    def get_family_status(self, genre):
        """Déterminer le statut familial approprié"""
        status_mapping = {
            'roman': ['célibataire', 'en couple', 'marié'],
            'science-fiction': ['célibataire', 'en couple', 'étudiant'],
            'fantasy': ['célibataire', 'en couple', 'étudiant'],
            'policier': ['célibataire', 'en couple', 'marié'],
            'biographie': ['célibataire', 'en couple', 'marié', 'parent'],
            'histoire': ['célibataire', 'en couple', 'marié', 'parent'],
            'développement personnel': ['célibataire', 'en couple', 'marié', 'parent', 'étudiant'],
            'cuisine': ['célibataire', 'en couple', 'marié', 'parent']
        }
        return status_mapping.get(genre, ['célibataire', 'en couple'])
    
    def save_to_database(self):
        """Sauvegarder les livres dans MongoDB"""
        if not self.client:
            print("Pas de connexion MongoDB disponible")
            return
        
        try:
            # Supprimer les anciens livres
            self.books_collection.delete_many({})
            
            # Insérer les nouveaux livres
            if self.books_data:
                result = self.books_collection.insert_many(self.books_data)
                print(f"{len(result.inserted_ids)} livres sauvegardés dans la base de données")
            else:
                print("Aucun livre à sauvegarder")
                
        except Exception as e:
            print(f"Erreur lors de la sauvegarde: {e}")
    
    def save_to_json(self, filename='books_data.json'):
        """Sauvegarder les données en JSON"""
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(self.books_data, f, ensure_ascii=False, indent=2)
            print(f"Données sauvegardées dans {filename}")
        except Exception as e:
            print(f"Erreur lors de la sauvegarde JSON: {e}")
    
    def scrape_all_genres(self):
        """Scraper tous les genres"""
        genres = ['roman', 'science-fiction', 'fantasy', 'policier', 'biographie', 'histoire', 'développement personnel', 'cuisine']
        
        for genre in genres:
            print(f"\n=== Scraping du genre: {genre} ===")
            self.search_books_by_genre(genre, max_pages=2)
            time.sleep(random.uniform(5, 10))  # Pause entre les genres
    
    def cleanup(self):
        """Nettoyer les ressources"""
        if self.driver:
            self.driver.quit()
        if self.client:
            self.client.close()

def main():
    """Fonction principale"""
    scraper = AmazonBookScraper()
    
    try:
        print("Début du scraping Amazon...")
        scraper.scrape_all_genres()
        
        print(f"\nTotal de livres récupérés: {len(scraper.books_data)}")
        
        # Sauvegarder les données
        scraper.save_to_database()
        scraper.save_to_json()
        
        print("Scraping terminé avec succès!")
        
    except KeyboardInterrupt:
        print("\nScraping interrompu par l'utilisateur")
    except Exception as e:
        print(f"Erreur lors du scraping: {e}")
    finally:
        scraper.cleanup()

if __name__ == "__main__":
    main() 