#!/bin/bash

# 🐓 Dummy Data Generator - Ayam Aduan (Using cURL)
# Generates 100 indukan, 50 breeding, 150 anakan

API_URL="https://script.google.com/macros/s/AKfycbzwt0uW7oqbw6EzfOa5g5w9D_q3UaVzYw-N7Qpl4cj_CwxZHf6JSpMmgO0Gq3wfgc65/exec"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Arrays
RAS=("Bangkok" "Saigon" "Burma" "Shamo" "Asil" "Birma" "Pakhoy" "Pelung" "Ciparage" "Jepang" "Filipino" "Lemon" "Brazilian" "Magon" "Siam")
WARNA=("Hitam" "Merah" "Putih" "Kuning" "Biru" "Hijau" "Abu-abu" "Coklat" "Emas" "Perak" "Hitam Putih" "Merah Hitam" "Kuning Hitam" "Belang Tiga" "Wido" "Laso" "Kembang" "Blorok")
STATUS=("Sehat" "Sakit" "Dijual" "Mati")

# Helper functions
random_element() {
    local arr=("$@")
    echo "${arr[$RANDOM % ${#arr[@]}]}"
}

random_date() {
    local start_year=$1
    local end_year=$2
    local year=$((start_year + RANDOM % (end_year - start_year + 1)))
    local month=$((1 + RANDOM % 12))
    local day=$((1 + RANDOM % 28))
    printf "%04d-%02d-%02d" $year $month $day
}

url_encode() {
    echo "$1" | sed 's/ /%20/g'
}

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🐓 DUMMY DATA GENERATOR - AYAM ADUAN (cURL)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

START_TIME=$(date +%s)

# Step 1: Generate Ayam Indukan
echo -e "${BLUE}━━━━━ STEP 1: AYAM INDUKAN ━━━━━${NC}"
echo -e "${YELLOW}🐓 Generating 100 Ayam Indukan...${NC}"

INDUKAN_IDS=()
SUCCESS_COUNT=0

for i in $(seq 1 100); do
    if [ $i -le 50 ]; then
        JENIS_KELAMIN="Jantan"
        PREFIX="JTN"
    else
        JENIS_KELAMIN="Betina"
        PREFIX="BTN"
    fi

    KODE="${PREFIX}-$(printf '%03d' $i)"
    RAS_VALUE=$(random_element "${RAS[@]}")
    WARNA_VALUE=$(random_element "${WARNA[@]}")
    TANGGAL_LAHIR=$(random_date 2020 2024)

    # URL encode spaces
    RAS_ENCODED=$(url_encode "$RAS_VALUE")
    WARNA_ENCODED=$(url_encode "$WARNA_VALUE")

    # Make API call
    RESPONSE=$(curl -s -w "\n%{http_code}" "${API_URL}?action=add_ayam_induk&kode=${KODE}&jenis_kelamin=${JENIS_KELAMIN}&ras=${RAS_ENCODED}&warna=${WARNA_ENCODED}&tanggal_lahir=${TANGGAL_LAHIR}")

    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | head -n-1)

    if [ "$HTTP_CODE" = "200" ]; then
        # Extract ID from response (assuming JSON response with "id" field)
        ID=$(echo "$BODY" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
        INDUKAN_IDS+=("$ID|$JENIS_KELAMIN")
        ((SUCCESS_COUNT++))

        if [ $((i % 10)) -eq 0 ]; then
            echo -e "  ${GREEN}✓${NC} Generated $i/100 indukan..."
        fi
    else
        echo -e "  ${RED}✗${NC} Failed to create indukan $i (HTTP $HTTP_CODE)"
    fi

    # Small delay to avoid rate limiting
    sleep 0.1
done

echo -e "${GREEN}✅ Generated ${SUCCESS_COUNT}/100 Ayam Indukan${NC}"
echo ""
sleep 2

# Step 2: Generate Breeding Data
echo -e "${BLUE}━━━━━ STEP 2: BREEDING DATA ━━━━━${NC}"
echo -e "${YELLOW}💑 Generating 50 Breeding records...${NC}"

# Separate jantan and betina
JANTAN_IDS=()
BETINA_IDS=()

for entry in "${INDUKAN_IDS[@]}"; do
    ID="${entry%|*}"
    JENIS="${entry#*|}"
    if [ "$JENIS" = "Jantan" ]; then
        JANTAN_IDS+=("$ID")
    else
        BETINA_IDS+=("$ID")
    fi
done

BREEDING_IDS=()
BREEDING_SUCCESS=0

for i in $(seq 1 50); do
    # Random jantan and betina
    PEJANTAN_ID="${JANTAN_IDS[$RANDOM % ${#JANTAN_IDS[@]}]}"
    BETINA_ID="${BETINA_IDS[$RANDOM % ${#BETINA_IDS[@]}]}"

    TANGGAL_KAWIN=$(random_date 2023 2024)

    # Calculate tanggal menetas (21 days after kawin)
    TANGGAL_MENETAS=$(date -d "$TANGGAL_KAWIN + 21 days" +%Y-%m-%d 2>/dev/null || date -v+21d -j -f "%Y-%m-%d" "$TANGGAL_KAWIN" +%Y-%m-%d)

    JUMLAH_ANAKAN=$((2 + RANDOM % 7))

    RESPONSE=$(curl -s -w "\n%{http_code}" "${API_URL}?action=add_breeding&pejantan_id=${PEJANTAN_ID}&betina_id=${BETINA_ID}&tanggal_kawin=${TANGGAL_KAWIN}&tanggal_menetas=${TANGGAL_MENETAS}&jumlah_anakan=${JUMLAH_ANAKAN}")

    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | head -n-1)

    if [ "$HTTP_CODE" = "200" ]; then
        ID=$(echo "$BODY" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
        BREEDING_IDS+=("$ID")
        ((BREEDING_SUCCESS++))

        if [ $((i % 5)) -eq 0 ]; then
            echo -e "  ${GREEN}✓${NC} Generated $i/50 breeding..."
        fi
    else
        echo -e "  ${RED}✗${NC} Failed to create breeding $i"
    fi

    sleep 0.1
done

echo -e "${GREEN}✅ Generated ${BREEDING_SUCCESS}/50 Breeding records${NC}"
echo ""
sleep 2

# Step 3: Generate Ayam Anakan
echo -e "${BLUE}━━━━━ STEP 3: AYAM ANAKAN ━━━━━${NC}"
echo -e "${YELLOW}🐣 Generating 150 Ayam Anakan...${NC}"

ANAKAN_SUCCESS=0
COUNTER=1

for BREEDING_ID in "${BREEDING_IDS[@]}"; do
    JUMLAH=$((2 + RANDOM % 4))

    for j in $(seq 1 $JUMLAH); do
        if [ $COUNTER -gt 150 ]; then
            break 2
        fi

        KODE="ANK-$(printf '%03d' $COUNTER)"

        if [ $((RANDOM % 2)) -eq 0 ]; then
            JENIS_KELAMIN="Jantan"
        else
            JENIS_KELAMIN="Betina"
        fi

        WARNA_VALUE=$(random_element "${WARNA[@]}")
        WARNA_ENCODED=$(url_encode "$WARNA_VALUE")

        # 80% Sehat, 20% random status
        if [ $((RANDOM % 100)) -lt 80 ]; then
            STATUS_VALUE="Sehat"
        else
            STATUS_VALUE=$(random_element "${STATUS[@]}")
        fi

        RESPONSE=$(curl -s -w "\n%{http_code}" "${API_URL}?action=add_ayam_anakan&breeding_id=${BREEDING_ID}&kode=${KODE}&jenis_kelamin=${JENIS_KELAMIN}&warna=${WARNA_ENCODED}&status=${STATUS_VALUE}")

        HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

        if [ "$HTTP_CODE" = "200" ]; then
            ((ANAKAN_SUCCESS++))

            if [ $((COUNTER % 15)) -eq 0 ]; then
                echo -e "  ${GREEN}✓${NC} Generated ${COUNTER}/150 anakan..."
            fi
        else
            echo -e "  ${RED}✗${NC} Failed to create anakan $COUNTER"
        fi

        ((COUNTER++))
        sleep 0.1
    done
done

echo -e "${GREEN}✅ Generated ${ANAKAN_SUCCESS}/150 Ayam Anakan${NC}"
echo ""

# Summary
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ DUMMY DATA GENERATION COMPLETE!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}📊 Summary:${NC}"
echo -e "   🐓 Ayam Indukan: ${SUCCESS_COUNT} / 100"
echo -e "   💑 Breeding: ${BREEDING_SUCCESS} / 50"
echo -e "   🐣 Ayam Anakan: ${ANAKAN_SUCCESS} / 150"
echo ""
echo -e "${BLUE}⏱️  Total time: ${DURATION}s${NC}"
echo ""
echo -e "${YELLOW}💡 Tip: Refresh aplikasi untuk melihat data baru!${NC}"
