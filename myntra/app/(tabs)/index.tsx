import {
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Search, ChevronRight } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { useTheme } from "@/context/ThemeContext";

const deals = [
  {
    id: 1,
    title: "Under ₹599",
    image:
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "40-70% Off",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500&auto=format&fit=crop",
  },
];

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [product, setproduct] = useState<any>(null);
  const [categories, setcategories] = useState<any>(null);
  const { user } = useAuth();
  const handleProductPress = (productId: number) => {
    if (!user) {
      router.push("/login");
    } else {
      router.push(`/product/${productId}`);
    }
  };

const {
    theme,
    mode,
    setMode,
    accent,
    setAccent,
  } = useTheme();

const dynamicStyles = createStyles(theme);
  useEffect(() => {
    const fetchproduct = async () => {
      try {
        setIsLoading(true);
        const cat = await axios.get("https://myntra-clone-7tse.onrender.com/category");
        const product = await axios.get("https://myntra-clone-7tse.onrender.com/product");
        setcategories(cat.data);
        setproduct(product.data);
      } catch (error) {
        console.log(error);
        setIsLoading(false);
      } finally {
        setIsLoading(false);
      }
    };
    fetchproduct();
  }, []);
  return (
    <ScrollView style={dynamicStyles.container}>
      <View style={dynamicStyles.header}>
        <Text style={dynamicStyles.logo}>MYNTRA</Text>
        <TouchableOpacity style={dynamicStyles.searchButton}>
          <Search size={24} color="#3e3e3e" />
        </TouchableOpacity>
      </View>

      <Image
        source={{
          uri: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&auto=format&fit=crop",
        }}
        style={dynamicStyles.banner}
      />

      <View style={dynamicStyles.section}>
        <View style={dynamicStyles.sectionHeader}>
          <Text style={dynamicStyles.sectionTitle}>SHOP BY CATEGORY</Text>
          <TouchableOpacity style={dynamicStyles.viewAll}>
            <Text style={dynamicStyles.viewAllText}>View All</Text>
            <ChevronRight size={20} color="#ff3f6c" />
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={dynamicStyles.categoriesScroll}
        >
          {isLoading ? (
            <ActivityIndicator
              size="large"
              color="#ff3f6c"
              style={dynamicStyles.loader}
            />
          ) : !categories || categories.length === 0 ? (
            <Text style={dynamicStyles.emptyText}>No categories available</Text>
          ) : (
            categories.map((category: any) => (
              <TouchableOpacity key={category._id} style={dynamicStyles.categoryCard}>
                <Image
                  source={{ uri: category.image }}
                  style={dynamicStyles.categoryImage}
                />
                <Text style={dynamicStyles.categoryName}>{category.name}</Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>

      <View style={dynamicStyles.section}>
        <View style={dynamicStyles.sectionHeader}>
          <Text style={dynamicStyles.sectionTitle}>DEALS OF THE DAY</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={dynamicStyles.dealsScroll}
        >
          {deals.map((deal) => (
            <TouchableOpacity key={deal.id} style={dynamicStyles.dealCard}>
              <Image source={{ uri: deal.image }} style={dynamicStyles.dealImage} />
              <View style={dynamicStyles.dealOverlay}>
                <Text style={dynamicStyles.dealTitle}>{deal.title}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={dynamicStyles.section}>
        <View style={dynamicStyles.sectionHeader}>
          <Text style={dynamicStyles.sectionTitle}>TRENDING NOW</Text>
        </View>
        <View style={dynamicStyles.productsGrid}>
          {isLoading ? (
            <ActivityIndicator
              size="large"
              color="#ff3f6c"
              style={dynamicStyles.loader}
            />
          ) : !product || product.length === 0 ? (
            <Text style={dynamicStyles.emptyText}>No Product available</Text>
          ) : ( 
            <View style={dynamicStyles.productsGrid}>
              {product.map((product: any) => (
                <TouchableOpacity
                  key={product._id}
                  style={dynamicStyles.productCard}
                  onPress={() => handleProductPress(product._id)}
                >
                  <Image
                    source={{ uri: product.images[0
                      
                    ] }}
                    style={dynamicStyles.productImage}
                  />
                  <View style={dynamicStyles.productInfo}>
                    <Text style={dynamicStyles.brandName}>{product.brand}</Text>
                    <Text style={dynamicStyles.productName}>{product.name}</Text>
                    <View style={dynamicStyles.priceRow}>
                      <Text style={dynamicStyles.productPrice}>{product.price}</Text>
                      <Text style={dynamicStyles.discount}>{product.discount}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

/*const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    paddingTop: 50,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#666",
  },
  logo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#3e3e3e",
  },
  searchButton: {
    padding: 8,
  },
  banner: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  section: {
    padding: 15,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3e3e3e",
  },
  viewAll: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewAllText: {
    color: "#ff3f6c",
    marginRight: 5,
  },
  categoriesScroll: {
    marginHorizontal: -15,
  },
  categoryCard: {
    width: 100,
    marginHorizontal: 8,
  },
  categoryImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  categoryName: {
    textAlign: "center",
    marginTop: 8,
    fontSize: 14,
    color: "#3e3e3e",
  },
  dealsScroll: {
    marginHorizontal: -15,
  },
  dealCard: {
    width: 280,
    height: 150,
    marginHorizontal: 8,
    borderRadius: 10,
    overflow: "hidden",
  },
  dealImage: {
    width: "100%",
    height: "100%",
  },
  dealOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 15,
  },
  dealTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -8,
  },
  productCard: {
    width: "48%",
    marginHorizontal: "1%",
    marginBottom: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  productImage: {
    width: "100%",
    height: 200,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  productInfo: {
    padding: 10,
  },
  brandName: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  productName: {
    fontSize: 16,
    marginBottom: 5,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#3e3e3e",
    marginRight: 8,
  },
  discount: {
    fontSize: 14,
    color: "#ff3f6c",
    fontWeight: "500",
  },
  loader: {
    marginTop: 50,
  },
});
*/


const createStyles = (theme:any)=>
StyleSheet.create({

container:{
flex:1,
backgroundColor:theme.background
},

header:{
flexDirection:"row",
justifyContent:"space-between",
alignItems:"center",
padding:15,
paddingTop:50,

backgroundColor:theme.card,

borderBottomWidth:1,
borderBottomColor:theme.border
},

emptyText:{
textAlign:"center",
marginTop:20,
fontSize:16,
color:theme.secondaryText
},

logo:{
fontSize:24,
fontWeight:"bold",
color:theme.text
},

searchButton:{
padding:8
},

banner:{
width:"100%",
height:200,
resizeMode:"cover"
},

section:{
padding:15
},

sectionHeader:{
flexDirection:"row",
justifyContent:"space-between",
alignItems:"center",
marginBottom:15
},

sectionTitle:{
fontSize:18,
fontWeight:"bold",
color:theme.text
},

viewAll:{
flexDirection:"row",
alignItems:"center"
},

viewAllText:{
color:theme.primary,
marginRight:5
},

categoriesScroll:{
marginHorizontal:-15
},

categoryCard:{
width:100,
marginHorizontal:8
},

categoryImage:{
width:100,
height:100,
borderRadius:50
},

categoryName:{
textAlign:"center",
marginTop:8,
fontSize:14,
color:theme.text
},

dealsScroll:{
marginHorizontal:-15
},

dealCard:{
width:280,
height:150,
marginHorizontal:8,
borderRadius:10,
overflow:"hidden"
},

dealImage:{
width:"100%",
height:"100%"
},

dealOverlay:{
position:"absolute",
bottom:0,
left:0,
right:0,
backgroundColor:"rgba(0,0,0,0.4)",
padding:15
},

dealTitle:{
color:"#fff",
fontSize:18,
fontWeight:"bold"
},

productsGrid:{
flexDirection:"row",
flexWrap:"wrap",
marginHorizontal:-8
},

productCard:{
width:"48%",
marginHorizontal:"1%",
marginBottom:15,

backgroundColor:theme.card,

borderRadius:10,

shadowColor:"#000",

shadowOffset:{
width:0,
height:2
},

shadowOpacity:0.1,
shadowRadius:3.84,

elevation:5
},

productImage:{
width:"100%",
height:200,
borderTopLeftRadius:10,
borderTopRightRadius:10
},

productInfo:{
padding:10
},

brandName:{
fontSize:14,
color:theme.secondaryText,
marginBottom:2
},

productName:{
fontSize:16,
marginBottom:5,
color:theme.text
},

priceRow:{
flexDirection:"row",
alignItems:"center"
},

productPrice:{
fontSize:16,
fontWeight:"bold",
color:theme.text,
marginRight:8
},

discount:{
fontSize:14,
color:theme.primary,
fontWeight:"500"
},

loader:{
marginTop:50
}

});