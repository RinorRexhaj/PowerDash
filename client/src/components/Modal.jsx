import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleCheck,
  faPenToSquare,
  faPlus,
  faRightFromBracket,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Modal = ({
  type,
  action,
  token,
  setToken,
  user,
  setUser,
  setSession,
  modalVisible,
  elements,
  setElements,
  elementsFilter,
  setElementsFilter,
  closeModal,
  postData,
  setPostData,
  editData,
  setEditData,
  deleteId,
}) => {
  const [productImage, setProductImage] = useState(new FormData());
  const [categories, setCategories] = useState([]);
  const [idError, setIdError] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [priceError, setPriceError] = useState("");
  const [actionDone, setActionDone] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (action !== "LOG-OUT") {
      if (type === "Products") {
        const response = axios
          .get("https://localhost:7262/Categories", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .then((resp) => setCategories(resp.data));
      } else
        setCategories([
          { categoryName: "Admin" },
          { categoryName: "User" },
          { categoryName: "Staff" },
        ]);
    }
  }, []);

  const postProduct = async () => {
    if (
      postData.category === null ||
      postData.category === undefined ||
      postData.category.length <= 0 ||
      postData.category === "Choose a category"
    ) {
      setCategoryError("Invalid Category!");
      return false;
    }
    let status, post;
    if (type === "Products") {
      post = {
        id: postData.id,
        name: postData.name,
        categoryName: postData.category,
        price: postData.price,
      };
    }
    const repsonse = await axios
      .post(`https://localhost:7262/${type}`, post, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((resp) => {
        if (resp.status === 200) status = true;
        setTimeout(() => {
          setElements([...elements, resp.data]);
          if (elementsFilter.length > 0)
            setElementsFilter([resp.data, ...elementsFilter]);
        }, 200);
      })
      .catch((err) => {
        // console.log(err);
        setIdError(err.response.data);
        status = false;
      });
    return status;
  };

  const editProduct = async () => {
    let edit;
    if (type === "Clients") {
      edit = {
        id: editData.id,
        fullName: editData.name,
        role: editData.categoryName,
        email: editData.email,
      };
    } else edit = editData;
    console.log(edit);
    const { data } = await axios.patch(`https://localhost:7262/${type}`, edit, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setElements(
      elements.map((el) => {
        if (el.id === data.id) return data;
        else return el;
      })
    );
    if (elementsFilter.length > 0)
      setElementsFilter(
        elementsFilter.map((el) => {
          if (el.id === data.id) return data;
          else return el;
        })
      );
  };

  const deleteProduct = async () => {
    const { data } = await axios.delete(
      `https://localhost:7262/${type}/${deleteId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    setElements(elements.filter((el) => el.id !== deleteId));
    if (elementsFilter.length > 0)
      setElementsFilter(elementsFilter.filter((el) => el.id !== deleteId));
  };

  const signOut = async () => {
    sessionStorage.clear();
    localStorage.clear();
    const connection = new HubConnectionBuilder()
      .withUrl("https://localhost:7262/chat", { withCredentials: false })
      .build();
    await connection
      .start()
      .then(() => {
        connection.invoke("Disconnect", user.id);
      })
      .catch((err) => console.log(err));
    const response = await axios
      .delete(`https://localhost:7262/Auth/logout/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((resp) => {
        setTimeout(() => {
          setToken("");
          setUser({});
          sessionStorage.clear();
          setSession(false);
          navigate("/sign-in");
          return true;
        }, 500);
      })
      .catch((err) => {
        console.log(err);
      });
    return false;
  };

  const handleErrors = (e) => {
    const { id, value } = e.target;

    if (value.length != 0) setIdError("");

    if (id === "id") {
      if (!/^\d+$/.test(value)) setIdError("ID only contains numbers!");
      else if (value.length === 0) setIdError("ID can't be empty!");
      else setIdError("");
    } else if (id === "price") {
      if (!/^\d+\.?\d{1,2}$/.test(value))
        setPriceError("Invalid Price format!");
      else if (value.length === 0) setIdError("Price can't be empty!");
      else setPriceError("");
    } else if (id === "category") {
      let exists = false;
      categories.forEach((c) => {
        if (c.categoryName === value) {
          exists = true;
        }
      });
      if (!exists) setCategoryError("Invalid Category!");
      else setCategoryError("");
    }
  };

  const handleFileUpload = async () => {
    if (
      productImage === null ||
      productImage === undefined ||
      productImage.size === undefined ||
      productImage.size <= 0 ||
      productImage.size > 5120000
    )
      return false;
    else {
      await axios
        .post(
          `https://localhost:7262/${type}/image/${
            action === "POST" ? postData.id : editData.id
          }`,
          { image: productImage },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        )
        .catch((err) => {
          console.log(err);
        });
      setElements([...elements]);
      setProductImage();
      return true;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (action === "LOG-OUT" && sessionStorage.length > 0) {
      signOut();
    } else if (action === "DELETE" && deleteId !== null && deleteId > 0) {
      deleteProduct();
    } else if (idError !== "" || priceError !== "" || categoryError !== "")
      return;
    else if (action === "POST") {
      const posted = await postProduct();
      if (posted) {
        if (await handleFileUpload());
        else return;
      } else return;
    } else if (action === "EDIT") {
      await handleFileUpload();
      await editProduct();
    }
    setTimeout(() => setActionDone(true), 300);
    setTimeout(() => {
      closeModal();
      setActionDone(false);
    }, 1000);
  };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center ${
        modalVisible ? "opacity-100 z-50" : "opacity-0 -z-99"
      } transition-opacity duration-200 ease-in`}
    >
      <div className="bg-white p-8 rounded-md z-50 w-100 md:w-80">
        <div className="relative items-center gap-6">
          <h2 className="relative text-3xl md:text-2xl mb-8 font-bold text-slate-800">
            {!actionDone
              ? action === "LOG-OUT"
                ? "Log Out"
                : `${
                    action[0] + action.slice(1).toLowerCase()
                  } Your ${type.substring(0, type.length - 1)}`
              : action === "LOG-OUT"
              ? ""
              : `Your ${type.substring(0, type.length - 1)} was ${
                  action !== "DELETE"
                    ? action[0] + action.slice(1).toLowerCase() + "ed"
                    : action[0] + action.slice(1).toLowerCase() + "d"
                }`}
          </h2>
          {actionDone && (
            <FontAwesomeIcon
              className="w-7 h-7 m-auto text-green-500 animate-ping-once"
              icon={faCircleCheck}
            />
          )}
          <button
            className="absolute -top-6 -right-4 text-4xl"
            onClick={() => {
              if (action !== "DELETE" && action !== "LOG-OUT") {
                setEditData({
                  id: "",
                  name: "",
                  category: "",
                  price: "",
                  image: "",
                });
              }
              closeModal();
            }}
          >
            &times;
          </button>
        </div>

        {!actionDone && (
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            {action !== "DELETE" && action !== "LOG-OUT" && (
              <>
                {type === "Products" && (
                  <div className="relative flex items-center justify-between ">
                    <label
                      htmlFor="id"
                      className="text-lg font-bold text-slate-600"
                    >
                      ID
                    </label>
                    <input
                      type="text"
                      className="w-60 md:w-40 appearance-none rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none  focus:border-blue-500 focus:shadow-outline bg-blue-50 border  border-slate-200"
                      id="id"
                      placeholder="Product ID..."
                      defaultValue={action === "EDIT" ? editData.id : ""}
                      readOnly={action === "EDIT" ? true : false}
                      onChange={(e) => {
                        handleErrors(e);
                        if (action === "POST")
                          setPostData({ ...postData, id: e.target.value });
                        else if (action === "EDIT")
                          setEditData({ ...editData, id: e.target.value });
                      }}
                      required
                    />
                    <div className="h-1 absolute bottom-0 left-25 text-red-500 font-medium text-md">
                      {idError}
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="name"
                    className=" text-lg font-bold text-slate-600"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    className="w-60 md:w-40 appearance-none rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none  focus:border-blue-500 focus:shadow-outline bg-blue-50 border  border-slate-200"
                    id="name"
                    placeholder={`${type.substring(
                      0,
                      type.length - 1
                    )} name...`}
                    defaultValue={action === "EDIT" ? editData.name : ""}
                    onChange={(e) => {
                      handleErrors(e);
                      if (action === "POST")
                        setPostData({ ...postData, name: e.target.value });
                      else if (action === "EDIT")
                        setEditData({ ...editData, name: e.target.value });
                    }}
                    required
                  />
                </div>
                <div className="relative flex items-center justify-between">
                  <label
                    htmlFor="category"
                    className="text-lg font-bold text-slate-600"
                  >
                    {type === "Products" ? "Category" : "Role"}
                  </label>
                  <select
                    className="w-60 md:w-40 bg-blue-50 border border-slate-200 text-gray-700  rounded focus:ring-blue-500 focus:border-blue-500 py-2 px-3 cursor-pointer"
                    id="category"
                    value={
                      editData.categoryName !== undefined
                        ? editData.categoryName
                        : postData.category !== undefined
                        ? postData.category
                        : "Choose a category"
                    }
                    onChange={(e) => {
                      handleErrors(e);
                      if (action === "POST")
                        setPostData({ ...postData, category: e.target.value });
                      else if (action === "EDIT")
                        setEditData({
                          ...editData,
                          categoryName: e.target.value,
                        });
                    }}
                    required
                  >
                    <option>
                      Choose a {type === "Products" ? "category" : "role"}
                    </option>
                    {categories.map((category) => {
                      return (
                        <option
                          key={category.categoryName}
                          value={category.categoryName}
                        >
                          {category.categoryName}
                        </option>
                      );
                    })}
                  </select>
                  <div className="h-1 absolute bottom-0 left-25 text-red-500 font-medium text-md">
                    {categoryError}
                  </div>
                </div>
                {type === "Products" && (
                  <div className="relative flex items-center justify-between">
                    <label
                      htmlFor="price"
                      className="text-lg font-bold text-slate-600"
                    >
                      Price
                    </label>
                    <input
                      type="text"
                      className="w-60 md:w-40 appearance-none rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none  focus:border-blue-500 focus:shadow-outline bg-blue-50 border  border-slate-200"
                      id="price"
                      placeholder="Product Price..."
                      defaultValue={editData.price}
                      onChange={(e) => {
                        handleErrors(e);
                        if (action === "POST")
                          setPostData({ ...postData, price: e.target.value });
                        else if (action === "EDIT")
                          setEditData({ ...editData, price: e.target.value });
                      }}
                      required
                    />
                    <div className="h-1 absolute bottom-0 left-25 text-red-500 font-medium text-md">
                      {priceError}
                    </div>
                  </div>
                )}
                {type === "Clients" && (
                  <div className="relative flex items-center justify-between">
                    <label
                      htmlFor="email"
                      className="text-lg font-bold text-slate-600"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      className="w-60 md:w-40 appearance-none rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none  focus:border-blue-500 focus:shadow-outline bg-blue-50 border  border-slate-200"
                      id="email"
                      placeholder="Client Email..."
                      defaultValue={editData.email}
                      onChange={(e) => {
                        handleErrors(e);
                        if (action === "POST")
                          setPostData({ ...postData, email: e.target.value });
                        else if (action === "EDIT")
                          setEditData({ ...editData, email: e.target.value });
                      }}
                      readOnly
                    />
                    <div className="h-1 absolute bottom-0 left-25 text-red-500 font-medium text-md">
                      {priceError}
                    </div>
                  </div>
                )}
                <div className="relative flex items-center justify-between">
                  <label className=" text-lg font-bold text-slate-600">
                    Image
                  </label>
                  <input
                    type="file"
                    accept="image/png, image/jpg, image/jpeg"
                    className="w-60 md:w-40 appearance-none rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none  focus:border-blue-500 focus:shadow-outline bg-blue-50 border  border-slate-200"
                    onChange={(e) => {
                      setProductImage(e.target.files[0]);
                    }}
                    required={action === "POST"}
                  />
                  <div className="h-1 absolute bottom-0 left-25 text-blue-700 font-medium text-sm">
                    {action === "EDIT" && "Leave empty to retain image"}
                  </div>
                </div>
              </>
            )}
            {action === "DELETE" || action === "LOG-OUT" ? (
              <h1 className="text-xl font-medium text-center">
                Are you sure you want to{" "}
                {action === "DELETE"
                  ? `delete product "${deleteId}"`
                  : action === "LOG-OUT"
                  ? "log out"
                  : ""}{" "}
                ?
              </h1>
            ) : (
              ""
            )}

            <button
              className={`w-35 md:w-25 h-10 flex items-center justify-center gap-2 rounded-md font-medium ${
                action !== "DELETE" && action !== "LOG-OUT"
                  ? "bg-blue-600 hover:bg-blue-500"
                  : "bg-red-600 hover:bg-red-500"
              } duration-150 ease-linear text-white ml-25`}
              type="submit"
            >
              <FontAwesomeIcon
                icon={
                  action === "POST"
                    ? faPlus
                    : action === "EDIT"
                    ? faPenToSquare
                    : action === "DELETE"
                    ? faTrash
                    : faRightFromBracket
                }
              />{" "}
              {action}{" "}
            </button>
          </form>
        )}
      </div>
      <div className="overlay fixed inset-0 bg-black opacity-50"></div>
    </div>
  );
};

export default Modal;
